#!/usr/bin/env python3
import pandas as pd
import json

def convert_excel_to_sake_data(excel_file_path, sheet_name="お酒データ"):
    try:
        # Excelファイルを読み込み（ヘッダーを手動で処理）
        df = pd.read_excel(excel_file_path, sheet_name=sheet_name, header=None)
        
        # データ構造:
        # 行1: ヘッダー - ['カテゴリー', '日本酒度', '酸度', '度数', '４タイプ分類', '価格帯', '価格']
        # 行2以降: データ - ['〇〇正宗', '純米酒', -2, 1, 12, 'A', 'M', 1500]
        
        sake_data = []
        
        # 行2から行4までのデータを処理（index 2, 3, 4）
        for i in range(2, min(len(df), 5)):
            row = df.iloc[i]
            
            # 基本データの抽出
            name = str(row[1])  # 銘柄名
            category = str(row[2])  # カテゴリー
            nihonshu_do = float(row[3]) if pd.notna(row[3]) else 0  # 日本酒度
            acidity = float(row[4]) if pd.notna(row[4]) else 1  # 酸度
            alcohol = float(row[5]) if pd.notna(row[5]) else 15  # 度数
            type_class = str(row[6]) if pd.notna(row[6]) else 'A'  # 4タイプ分類
            price_range = str(row[7]) if pd.notna(row[7]) else 'M'  # 価格帯
            price = int(row[8]) if pd.notna(row[8]) else 3000  # 価格
            
            # 日本酒度から甘辛度を計算（-15～+15の範囲を1～10にマッピング）
            # 日本酒度が低い（マイナス）ほど甘口、高い（プラス）ほど辛口
            sweetness = max(1, min(10, 6 - (nihonshu_do / 3)))
            
            # 酸度からさっぱり度を計算
            acidity_score = max(1, min(10, acidity * 3))
            
            # 度数からコク（richness）を推定
            richness = max(1, min(10, (alcohol - 10) / 2 + 5))
            
            # 香りは種類から推定
            if '吟醸' in category or '大吟醸' in category:
                aroma = 8
            elif '純米' in category:
                aroma = 6
            else:
                aroma = 4
            
            # 都道府県を銘柄名から推定（簡易版）
            prefecture_map = {
                '正宗': '新潟県',
                '錦': '京都府', 
                '男山': '北海道'
            }
            prefecture = '未設定'
            for key, value in prefecture_map.items():
                if key in name:
                    prefecture = value
                    break
            
            # 酒蔵名を生成
            brewery = name.replace('〇〇', '').replace('××', '').replace('△△', '') + '酒造'
            
            # TypeScriptの型に合わせたデータ構造を作成
            sake_item = {
                "id": f"sake{i-1:03d}",
                "name": name,
                "brewery": brewery,
                "price": price,
                "alcoholContent": alcohol,
                "riceMilling": 55 if '吟醸' in category else 70,  # 推定値
                "sweetness": round(sweetness, 1),
                "richness": round(richness, 1),
                "acidity": round(acidity_score, 1),
                "aroma": aroma,
                "type": category,
                "prefecture": prefecture,
                "description": f"{category}の特徴を活かした、{type_class}タイプの日本酒です。",
                "ecUrl": f"https://example-ec.com/sake{i-1:03d}",
                "tags": []
            }
            
            # タグの設定
            if sweetness > 7:
                sake_item["tags"].append("甘口")
            elif sweetness < 4:
                sake_item["tags"].append("辛口")
            
            if price < 1500:
                sake_item["tags"].append("コスパ良")
            elif price > 2500:
                sake_item["tags"].append("高級")
                
            if '吟醸' in category:
                sake_item["tags"].append("フルーティー")
                sake_item["tags"].append("華やか")
            
            if not sake_item["tags"]:
                sake_item["tags"].append("おすすめ")
            
            sake_data.append(sake_item)
        
        return sake_data
        
    except Exception as e:
        print(f"エラーが発生しました: {e}")
        return None

if __name__ == "__main__":
    excel_file = "/workspaces/org-app/お酒とお料理相性マトリックス.xlsx"
    
    # データ変換実行
    sake_data = convert_excel_to_sake_data(excel_file)
    
    if sake_data:
        # JSONファイルに出力
        output_file = "/workspaces/org-app/org-app/lib/data/sake-data-excel.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(sake_data, f, ensure_ascii=False, indent=2)
        
        print(f"変換完了! {len(sake_data)}件のデータを {output_file} に保存しました")
        
        # 全データを表示
        for i, sake in enumerate(sake_data):
            print(f"\n=== 日本酒 {i+1} ===")
            print(json.dumps(sake, ensure_ascii=False, indent=2))
    else:
        print("データの変換に失敗しました")