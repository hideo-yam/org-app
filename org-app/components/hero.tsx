import Link from "next/link";

export function Hero() {
  return (
    <div className="flex flex-col gap-16 items-center">
      <div className="text-center space-y-8">
        <div className="text-6xl mb-4">🍶</div>
        <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white">
          好みの日本酒
          <span className="text-blue-600 dark:text-blue-400">探し</span>
        </h1>
        <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          簡単な質問に答えて、あなたにぴったりの日本酒を見つけましょう
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 w-full max-w-4xl">
        <div className="text-center space-y-4 p-6 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <div className="text-4xl">📝</div>
          <h3 className="text-lg font-semibold">簡単診断</h3>
          <p className="text-gray-600 dark:text-gray-300">
            6つの質問に答えるだけで、あなたの好みを分析します
          </p>
        </div>
        
        <div className="text-center space-y-4 p-6 rounded-lg bg-green-50 dark:bg-green-900/20">
          <div className="text-4xl">🎯</div>
          <h3 className="text-lg font-semibold">的確な提案</h3>
          <p className="text-gray-600 dark:text-gray-300">
            診断結果に基づいて、最適な日本酒を3つ厳選してご提案
          </p>
        </div>
        
        <div className="text-center space-y-4 p-6 rounded-lg bg-purple-50 dark:bg-purple-900/20">
          <div className="text-4xl">🛒</div>
          <h3 className="text-lg font-semibold">簡単購入</h3>
          <p className="text-gray-600 dark:text-gray-300">
            気に入った日本酒はワンクリックで購入サイトにアクセス
          </p>
        </div>
      </div>

      <Link 
        href="/sake-finder"
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-colors shadow-lg hover:shadow-xl"
      >
        診断を始める
      </Link>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        <p>🔞 20歳未満の飲酒は法律で禁止されています</p>
      </div>

      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  );
}
