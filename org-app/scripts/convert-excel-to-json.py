#!/usr/bin/env python3
import pandas as pd
import json
import sys
import os

def convert_excel_to_json(excel_file_path, sheet_name="お酒データ"):
    try:
        # Excelファイルを読み込み
        df = pd.read_excel(excel_file_path, sheet_name=sheet_name)
        
        # データフレームの情報を表示
        print(f"シート '{sheet_name}' を読み込みました")
        print(f"行数: {len(df)}, 列数: {len(df.columns)}")
        print(f"列名: {list(df.columns)}")
        print("\n最初の5行:")
        print(df.head())
        
        # NaN値を適切な値に置き換え
        df = df.fillna("")
        
        # データフレームをJSON形式に変換
        sake_data = []
        
        for index, row in df.iterrows():
            # カラム名の対応付け（実際のExcelの列名に合わせて調整が必要）
            sake_item = {}
            
            # 基本的な列名パターンを試す
            possible_names = ['名前', '銘柄', '商品名', 'name', 'Name', '日本酒名']
            name_col = None
            for col in possible_names:
                if col in df.columns:
                    name_col = col
                    break
            
            if name_col:
                sake_item['name'] = str(row[name_col])
            else:
                sake_item['name'] = f"日本酒_{index + 1}"
            
            # 他の基本情報を試行錯誤で取得
            # 実際のExcelファイルの構造に合わせて調整します
            for col in df.columns:
                col_lower = str(col).lower()
                if '価格' in str(col) or 'price' in col_lower:
                    try:
                        sake_item['price'] = int(float(str(row[col]).replace('¥', '').replace(',', '')))
                    except:
                        sake_item['price'] = 3000  # デフォルト値
                elif '酒蔵' in str(col) or 'brewery' in col_lower or '蔵元' in str(col):
                    sake_item['brewery'] = str(row[col])
                elif 'アルコール' in str(col) or 'alcohol' in col_lower:
                    try:
                        sake_item['alcoholContent'] = float(str(row[col]).replace('%', ''))
                    except:
                        sake_item['alcoholContent'] = 15.0
                elif '精米' in str(col) or 'milling' in col_lower:
                    try:
                        sake_item['riceMilling'] = int(float(str(row[col]).replace('%', '')))
                    except:
                        sake_item['riceMilling'] = 60
                elif '甘' in str(col) or 'sweet' in col_lower:
                    try:
                        sake_item['sweetness'] = int(float(row[col]))
                    except:
                        sake_item['sweetness'] = 5
                elif 'コク' in str(col) or 'rich' in col_lower or '濃' in str(col):
                    try:
                        sake_item['richness'] = int(float(row[col]))
                    except:
                        sake_item['richness'] = 5
                elif '香り' in str(col) or 'aroma' in col_lower:
                    try:
                        sake_item['aroma'] = int(float(row[col]))
                    except:
                        sake_item['aroma'] = 5
                elif '酸' in str(col) or 'acid' in col_lower:
                    try:
                        sake_item['acidity'] = int(float(row[col]))
                    except:
                        sake_item['acidity'] = 5
                elif '種類' in str(col) or 'type' in col_lower or '分類' in str(col):
                    sake_item['type'] = str(row[col])
                elif '都道府県' in str(col) or '県' in str(col) or 'prefecture' in col_lower:
                    sake_item['prefecture'] = str(row[col])
                elif '説明' in str(col) or 'description' in col_lower or '特徴' in str(col):
                    sake_item['description'] = str(row[col])
            
            # デフォルト値の設定
            sake_item.setdefault('id', f'sake{index + 1:03d}')
            sake_item.setdefault('brewery', '未設定')
            sake_item.setdefault('price', 3000)
            sake_item.setdefault('alcoholContent', 15.0)
            sake_item.setdefault('riceMilling', 60)
            sake_item.setdefault('sweetness', 5)
            sake_item.setdefault('richness', 5)
            sake_item.setdefault('acidity', 5)
            sake_item.setdefault('aroma', 5)
            sake_item.setdefault('type', '純米')
            sake_item.setdefault('prefecture', '未設定')
            sake_item.setdefault('description', '美味しい日本酒です。')
            sake_item.setdefault('ecUrl', f'https://example-ec.com/{sake_item["id"]}')
            sake_item.setdefault('tags', ['おすすめ'])
            
            # 空の名前をスキップ
            if sake_item['name'] and sake_item['name'] != 'nan':
                sake_data.append(sake_item)
        
        return sake_data
        
    except Exception as e:
        print(f"エラーが発生しました: {e}")
        return None

if __name__ == "__main__":
    excel_file = "/workspaces/org-app/お酒とお料理相性マトリックス.xlsx"
    
    if not os.path.exists(excel_file):
        print(f"ファイルが見つかりません: {excel_file}")
        sys.exit(1)
    
    # シート名を確認
    try:
        xl_file = pd.ExcelFile(excel_file)
        print(f"利用可能なシート名: {xl_file.sheet_names}")
        
        # 'お酒データ'シートがあるかチェック
        target_sheet = "お酒データ"
        if target_sheet not in xl_file.sheet_names:
            # 代替シート名を試す
            possible_sheets = ["お酒データ", "酒データ", "データ", "Sheet1", "data"]
            target_sheet = None
            for sheet in possible_sheets:
                if sheet in xl_file.sheet_names:
                    target_sheet = sheet
                    break
            
            if not target_sheet:
                target_sheet = xl_file.sheet_names[0]  # 最初のシートを使用
        
        print(f"使用するシート: {target_sheet}")
        
        # データ変換実行
        sake_data = convert_excel_to_json(excel_file, target_sheet)
        
        if sake_data:
            # JSONファイルに出力
            output_file = "/workspaces/org-app/org-app/lib/data/sake-data-from-excel.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(sake_data, f, ensure_ascii=False, indent=2)
            
            print(f"\n変換完了! {len(sake_data)}件のデータを {output_file} に保存しました")
            
            # 最初の1件を表示
            if sake_data:
                print("\n最初のデータ例:")
                print(json.dumps(sake_data[0], ensure_ascii=False, indent=2))
        else:
            print("データの変換に失敗しました")
            
    except Exception as e:
        print(f"ファイル読み込みエラー: {e}")