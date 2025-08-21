import { SakeProfile } from '@/lib/data/sake-data';

export interface PurchaseEvent {
  sakeId: string;
  sakeName: string;
  price: number;
  timestamp: Date;
  referrer: 'diagnosis' | 'browse' | 'recommendation';
}

export class PurchaseHandler {
  private static instance: PurchaseHandler;
  private events: PurchaseEvent[] = [];

  static getInstance(): PurchaseHandler {
    if (!PurchaseHandler.instance) {
      PurchaseHandler.instance = new PurchaseHandler();
    }
    return PurchaseHandler.instance;
  }

  /**
   * 購入ページへの遷移を処理
   */
  handlePurchase(sake: SakeProfile, referrer: PurchaseEvent['referrer'] = 'diagnosis'): void {
    // アナリティクス記録
    this.recordPurchaseEvent(sake, referrer);
    
    // 外部サイトへのリンクの安全性チェック
    if (this.isValidEcUrl(sake.ecUrl)) {
      // 新しいタブで開く
      window.open(sake.ecUrl, '_blank', 'noopener,noreferrer');
    } else {
      console.error('Invalid EC URL:', sake.ecUrl);
      alert('申し訳ございませんが、購入サイトへのリンクに問題があります。');
    }
  }

  /**
   * 購入イベントを記録
   */
  private recordPurchaseEvent(sake: SakeProfile, referrer: PurchaseEvent['referrer']): void {
    const event: PurchaseEvent = {
      sakeId: sake.id,
      sakeName: sake.name,
      price: sake.price,
      timestamp: new Date(),
      referrer
    };

    this.events.push(event);
    
    // ローカルストレージに保存（簡易的な実装）
    this.savePurchaseEvents();
    
    // 実際のプロダクションでは、ここでサーバーにイベントを送信
    this.sendAnalytics(event);
  }

  /**
   * ECサイトURLの妥当性チェック
   */
  private isValidEcUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      // HTTPSのみ許可
      if (urlObj.protocol !== 'https:') {
        return false;
      }
      
      // 許可されたドメインのリスト（実際の環境では設定ファイルから読み込む）
      const allowedDomains = [
        'example-ec.com',
        'rakuten.co.jp',
        'amazon.co.jp',
        'yahoo-shopping.jp',
        'issendo.jp',
        // 他の信頼できるECサイトドメイン
      ];
      
      return allowedDomains.some(domain => 
        urlObj.hostname === domain || 
        urlObj.hostname.endsWith('.' + domain)
      );
    } catch {
      return false;
    }
  }

  /**
   * ローカルストレージに購入イベントを保存
   */
  private savePurchaseEvents(): void {
    try {
      localStorage.setItem('sake_purchase_events', JSON.stringify(this.events));
    } catch (error) {
      console.warn('Failed to save purchase events to localStorage:', error);
    }
  }

  /**
   * ローカルストレージから購入イベントを読み込み
   */
  loadPurchaseEvents(): void {
    try {
      const saved = localStorage.getItem('sake_purchase_events');
      if (saved) {
        this.events = JSON.parse(saved).map((event: Partial<PurchaseEvent>) => ({
          sakeId: event.sakeId || '',
          sakeName: event.sakeName || '',
          price: event.price || 0,
          timestamp: new Date(event.timestamp || Date.now()),
          referrer: event.referrer || 'diagnosis'
        }));
      }
    } catch (error) {
      console.warn('Failed to load purchase events from localStorage:', error);
    }
  }

  /**
   * アナリティクスデータ送信（モック実装）
   */
  private sendAnalytics(event: PurchaseEvent): void {
    // 実際のプロダクションでは、Google Analytics、Adobe Analytics等に送信
    console.log('Analytics Event:', {
      event_name: 'sake_purchase_click',
      event_category: 'ec_integration',
      event_label: event.sakeName,
      value: event.price,
      custom_parameters: {
        sake_id: event.sakeId,
        referrer: event.referrer,
        timestamp: event.timestamp.toISOString()
      }
    });

    // GTM (Google Tag Manager) がある場合の例
    if (typeof window !== 'undefined' && (window as typeof window & { dataLayer?: unknown[] }).dataLayer) {
      (window as typeof window & { dataLayer: unknown[] }).dataLayer.push({
        event: 'sake_purchase_click',
        sake_id: event.sakeId,
        sake_name: event.sakeName,
        sake_price: event.price,
        referrer: event.referrer
      });
    }
  }

  /**
   * 購入イベント統計を取得
   */
  getPurchaseStats(): {
    totalClicks: number;
    popularSakes: { sakeId: string; sakeName: string; clicks: number }[];
    referrerStats: Record<PurchaseEvent['referrer'], number>;
  } {
    const totalClicks = this.events.length;
    
    // 人気の日本酒
    const sakeClickCounts = this.events.reduce((acc, event) => {
      const key = event.sakeId;
      acc[key] = {
        sakeId: event.sakeId,
        sakeName: event.sakeName,
        clicks: (acc[key]?.clicks || 0) + 1
      };
      return acc;
    }, {} as Record<string, { sakeId: string; sakeName: string; clicks: number }>);

    const popularSakes = Object.values(sakeClickCounts)
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);

    // 参照元統計
    const referrerStats = this.events.reduce((acc, event) => {
      acc[event.referrer] = (acc[event.referrer] || 0) + 1;
      return acc;
    }, {} as Record<PurchaseEvent['referrer'], number>);

    return {
      totalClicks,
      popularSakes,
      referrerStats
    };
  }

  /**
   * 購入履歴をクリア（開発・テスト用）
   */
  clearPurchaseHistory(): void {
    this.events = [];
    localStorage.removeItem('sake_purchase_events');
  }
}

// シングルトンインスタンスのエクスポート
export const purchaseHandler = PurchaseHandler.getInstance();