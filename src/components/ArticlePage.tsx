import { useParams, Link } from 'react-router-dom';
import { getArticle, articles } from '../data/articles';
import AdSlot from './AdSlot';
import AD_SLOTS from '../config/adSlots';

function renderMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-t1 font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticle(slug) : undefined;

  if (!article) {
    return (
      <div className="space-y-6">
        <h2 className="text-base sm:text-lg font-semibold text-amber-500">实用攻略</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {articles.map((a) => (
            <Link
              key={a.slug}
              to={`/guide/${a.slug}`}
              className="rounded-xl bg-card border border-b1 p-4 sm:p-5 card-shadow hover:border-amber-500/50 transition-colors group"
            >
              <h3 className="text-sm sm:text-base font-semibold text-t1 group-hover:text-amber-500 transition-colors mb-2 leading-snug">
                {a.title}
              </h3>
              <p className="text-xs text-t4 line-clamp-2">{a.description}</p>
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {a.keywords.slice(0, 3).map((kw) => (
                  <span key={kw} className="text-[10px] px-2 py-0.5 rounded-full bg-elevated text-t4">{kw}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <article className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
      <div className="rounded-2xl bg-card border border-b1 p-4 sm:p-6 card-shadow">
        <Link to="/guide" className="text-xs text-t4 hover:text-amber-500 transition-colors">← 全部攻略</Link>

        <h1 className="text-lg sm:text-2xl font-bold text-t1 mt-3 mb-2 leading-tight">
          {article.title}
        </h1>
        <p className="text-xs sm:text-sm text-t4 mb-4">{article.description}</p>

        <div className="flex gap-1.5 flex-wrap mb-4">
          {article.keywords.map((kw) => (
            <span key={kw} className="text-[10px] px-2 py-0.5 rounded-full bg-elevated text-t4">{kw}</span>
          ))}
        </div>
      </div>

      {article.content.map((section, i) => (
        <div key={i}>
          <div className="rounded-2xl bg-card border border-b1 p-4 sm:p-6 card-shadow">
            <h2 className="text-sm sm:text-lg font-semibold text-amber-500 mb-3">{section.heading}</h2>
            <div className="text-xs sm:text-sm text-t2 leading-relaxed whitespace-pre-line">
              {renderMarkdown(section.body)}
            </div>
            {section.tip && (
              <div className="mt-3 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                <div className="text-[10px] text-amber-500/70 uppercase tracking-widest mb-1">提示</div>
                <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400">{section.tip}</p>
              </div>
            )}
          </div>
          {i === 1 && <div className="mt-4 sm:mt-6"><AdSlot {...AD_SLOTS.articleInline} /></div>}
        </div>
      ))}

      {article.relatedTool && (
        <div className="rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/20 p-4 sm:p-5 text-center">
          <p className="text-xs sm:text-sm text-t3 mb-3">想要精确计算？试试相关工具</p>
          <Link
            to={article.relatedTool}
            className="inline-block px-5 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
          >
            打开计算器
          </Link>
        </div>
      )}

      <div className="text-[10px] text-t6 text-center">
        最后更新：{article.updatedAt} · 内容仅供参考，以官方政策为准
      </div>
    </article>
  );
}
