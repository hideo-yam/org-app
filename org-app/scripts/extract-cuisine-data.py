#!/usr/bin/env python3
import pandas as pd
import json

def extract_cuisine_matrix_data(excel_file_path):
    """お酒とお料理相性マトリックスから料理データを抽出"""
    
    all_cuisine_data = {
        'japanese': [],
        'chinese': [],
        'western': []
    }
    
    cuisine_sheets = {
        '和食': 'japanese',
        '中華': 'chinese', 
        '洋食': 'western'
    }
    
    try:
        xl_file = pd.ExcelFile(excel_file_path)
        
        for sheet_name, cuisine_key in cuisine_sheets.items():
            if sheet_name not in xl_file.sheet_names:
                print(f"{sheet_name}シートが見つかりません")
                continue
                
            print(f"\n=== {sheet_name}シート処理中 ===")
            df = pd.read_excel(excel_file_path, sheet_name=sheet_name, header=None)
            
            # データ行を処理（行2-5）
            for i in range(2, min(6, len(df))):
                row = df.iloc[i]
                
                dish_name = str(row[1]) if pd.notna(row[1]) else ''
                if not dish_name:
                    continue
                    
                # 数値データの抽出（NaNの場合はデフォルト値を使用）
                sake_min = float(row[2]) if pd.notna(row[2]) else 0
                sake_max = float(row[3]) if pd.notna(row[3]) else 10
                acidity_min = float(row[4]) if pd.notna(row[4]) else 0
                acidity_max = float(row[5]) if pd.notna(row[5]) else 2
                alcohol_min = float(row[6]) if pd.notna(row[6]) else 10
                alcohol_max = float(row[7]) if pd.notna(row[7]) else 18
                type_class1 = str(row[8]) if pd.notna(row[8]) else 'A'
                type_class2 = str(row[9]) if pd.notna(row[9]) else 'B'
                
                # IDを生成（料理名から）
                dish_id = generate_dish_id(dish_name, cuisine_key)
                
                dish_data = {
                    'id': dish_id,
                    'name': dish_name,
                    'cuisine_type': cuisine_key,
                    'compatibility': {
                        'sake_min_level': sake_min,
                        'sake_max_level': sake_max,
                        'acidity_min': acidity_min,
                        'acidity_max': acidity_max,
                        'alcohol_min': alcohol_min,
                        'alcohol_max': alcohol_max,
                    },
                    'type_class1': type_class1,
                    'type_class2': type_class2,
                    'match_bonus': calculate_match_bonus(cuisine_key, dish_name)
                }
                
                all_cuisine_data[cuisine_key].append(dish_data)
                print(f"追加: {dish_name} (ID: {dish_id})")
        
        return all_cuisine_data
        
    except Exception as e:
        print(f"エラーが発生しました: {e}")
        return None

def generate_dish_id(dish_name, cuisine_type):
    """料理名からIDを生成"""
    id_map = {
        # 和食
        '刺身/寿司': 'sashimi_sushi',
        '煮物': 'nimono', 
        '焼き物': 'yakimono',
        '揚げ物': 'agemono',
        # 中華
        '天津': 'tenshin',
        '濃い味': 'strong_taste',
        '薄味': 'light_taste',
        # 洋食
        'カルパッチョ/生牡蠣': 'carpaccio_oyster',
        '肉料理': 'meat_dish',
        '魚料理': 'fish_dish',
        'ジビエ': 'gibier'
    }
    
    # 中華の揚げ物は区別する
    if dish_name == '揚げ物' and cuisine_type == 'chinese':
        return 'chinese_fried'
    
    return id_map.get(dish_name, dish_name.lower().replace('/', '_').replace(' ', '_'))

def calculate_match_bonus(cuisine_type, dish_name):
    """料理タイプに基づくマッチボーナススコア"""
    bonus_map = {
        'japanese': 2.0,
        'chinese': 1.5,
        'western': 1.8
    }
    
    # 特定の料理には追加ボーナス
    if dish_name in ['刺身/寿司', 'カルパッチョ/生牡蠣']:
        return bonus_map.get(cuisine_type, 1.0) + 0.5
    
    return bonus_map.get(cuisine_type, 1.0)

def generate_typescript_interface(cuisine_data):
    """TypeScript用のインターフェースとデータを生成"""
    
    typescript_code = '''// お酒とお料理相性マトリックスから抽出した詳細料理データ

export interface DishCompatibilityDetail {
  id: string;
  name: string;
  cuisineType: 'japanese' | 'chinese' | 'western';
  compatibility: {
    sakeMinLevel: number;
    sakeMaxLevel: number;
    acidityMin: number;
    acidityMax: number;
    alcoholMin: number;
    alcoholMax: number;
  };
  typeClass1: string;
  typeClass2: string;
  matchBonus: number;
}

export const dishCompatibilityData: DishCompatibilityDetail[] = [
'''
    
    all_dishes = []
    for cuisine_type, dishes in cuisine_data.items():
        all_dishes.extend(dishes)
    
    for dish in all_dishes:
        typescript_code += f'''  {{
    id: "{dish['id']}",
    name: "{dish['name']}",
    cuisineType: "{dish['cuisine_type']}",
    compatibility: {{
      sakeMinLevel: {dish['compatibility']['sake_min_level']},
      sakeMaxLevel: {dish['compatibility']['sake_max_level']},
      acidityMin: {dish['compatibility']['acidity_min']},
      acidityMax: {dish['compatibility']['acidity_max']},
      alcoholMin: {dish['compatibility']['alcohol_min']},
      alcoholMax: {dish['compatibility']['alcohol_max']},
    }},
    typeClass1: "{dish['type_class1']}",
    typeClass2: "{dish['type_class2']}",
    matchBonus: {dish['match_bonus']}
  }},
'''
    
    typescript_code = typescript_code.rstrip(',\n') + '\n];\n'
    
    # 料理IDから名前を取得する関数を追加
    typescript_code += '''
// 料理IDから表示名を取得
export function getDishDisplayName(dishId: string): string {
  const dish = dishCompatibilityData.find(d => d.id === dishId);
  return dish ? dish.name : dishId;
}

// 料理タイプから該当料理一覧を取得  
export function getDishesByCuisineType(cuisineType: 'japanese' | 'chinese' | 'western'): DishCompatibilityDetail[] {
  return dishCompatibilityData.filter(d => d.cuisineType === cuisineType);
}
'''
    
    return typescript_code

if __name__ == "__main__":
    excel_file = "/workspaces/org-app/お酒とお料理相性マトリックス.xlsx"
    
    # データ抽出実行
    cuisine_data = extract_cuisine_matrix_data(excel_file)
    
    if cuisine_data:
        # JSONファイルに出力
        json_output_file = "/workspaces/org-app/org-app/lib/data/dish-compatibility-matrix.json"
        with open(json_output_file, 'w', encoding='utf-8') as f:
            json.dump(cuisine_data, f, ensure_ascii=False, indent=2)
        
        print(f"\\nJSONデータを {json_output_file} に保存しました")
        
        # TypeScriptファイルに出力
        ts_output_file = "/workspaces/org-app/org-app/lib/data/dish-compatibility-matrix.ts"
        typescript_code = generate_typescript_interface(cuisine_data)
        with open(ts_output_file, 'w', encoding='utf-8') as f:
            f.write(typescript_code)
        
        print(f"TypeScriptファイルを {ts_output_file} に保存しました")
        
        # サマリー表示
        total_dishes = sum(len(dishes) for dishes in cuisine_data.values())
        print(f"\\n=== 抽出完了 ===")
        print(f"総料理数: {total_dishes}品")
        for cuisine_type, dishes in cuisine_data.items():
            print(f"{cuisine_type}: {len(dishes)}品 - {[d['name'] for d in dishes]}")
        
    else:
        print("データの抽出に失敗しました")