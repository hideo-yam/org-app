import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-cover bg-center bg-no-repeat bg-fixed bg-gray-100 dark:bg-gray-900" 
          style={{backgroundImage: `linear-gradient(rgba(255,255,255,0.8), rgba(255,255,255,0.8)), url(/お酒と料理_画像.JPG)`, backgroundSize: '100% 100%'}}>
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"} className="text-lg">🍶 好みの日本酒探し</Link>
              <Link href={"/sake-finder"} className="text-blue-600 hover:text-blue-800 ml-4">
                診断を始める
              </Link>
            </div>
            <ThemeSwitcher />
          </div>
        </nav>
        
        <div className="flex-1 flex flex-col gap-20 max-w-6xl p-5">
          <Hero />
          
          <section className="text-center space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              こんな方におすすめ
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold mb-2">日本酒初心者の方</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  種類が多すぎて何を選べばいいか分からない
                </p>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold mb-2">贈り物を探している方</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  相手の好みに合った日本酒を選びたい
                </p>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold mb-2">新しい味を試したい方</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  自分の好みに合う新しい銘柄を発見したい
                </p>
              </div>
            </div>
          </section>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p className="text-gray-500 dark:text-gray-400">
            © 2024 好みの日本酒探し - 責任ある飲酒を心がけましょう
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
