#!/usr/bin/env python3
import pandas as pd

def analyze_cuisine_sheets(excel_file_path):
    try:
        xl_file = pd.ExcelFile(excel_file_path)
        print(f"利用可能なシート: {xl_file.sheet_names}")
        
        cuisine_sheets = ["和食", "中華", "洋食"]
        
        for sheet_name in cuisine_sheets:
            if sheet_name in xl_file.sheet_names:
                print(f"\n=== {sheet_name}シートの分析 ===")
                df = pd.read_excel(excel_file_path, sheet_name=sheet_name, header=None)
                
                print(f"サイズ: {df.shape}")
                print("\n生データ:")
                for i in range(min(10, len(df))):
                    print(f"行 {i}: {list(df.iloc[i])}")
                
                print(f"\n{sheet_name}シートの詳細:")
                for col in range(min(len(df.columns), 10)):
                    values = df.iloc[:, col].dropna().tolist()
                    if values:
                        print(f"列 {col}: {values}")
            else:
                print(f"{sheet_name}シートが見つかりません")
                
    except Exception as e:
        print(f"エラー: {e}")

if __name__ == "__main__":
    excel_file = "/workspaces/org-app/お酒とお料理相性マトリックス.xlsx"
    analyze_cuisine_sheets(excel_file)