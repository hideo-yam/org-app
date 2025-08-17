#!/usr/bin/env python3
import pandas as pd

def analyze_excel_structure(excel_file_path, sheet_name="お酒データ"):
    try:
        # Excelファイルを読み込み（ヘッダーを指定せずに）
        df = pd.read_excel(excel_file_path, sheet_name=sheet_name, header=None)
        
        print(f"シート '{sheet_name}' の詳細分析:")
        print(f"全体のサイズ: {df.shape}")
        print("\n=== 生データの表示 ===")
        
        for i in range(min(10, len(df))):
            print(f"行 {i}: {list(df.iloc[i])}")
        
        print("\n=== カラム別データ確認 ===")
        for col in range(min(10, len(df.columns))):
            print(f"列 {col}: {list(df.iloc[:, col].dropna())}")
            
    except Exception as e:
        print(f"エラーが発生しました: {e}")

if __name__ == "__main__":
    excel_file = "/workspaces/org-app/お酒とお料理相性マトリックス.xlsx"
    analyze_excel_structure(excel_file)