'use client';

import { useEffect, useState } from 'react';
import StockSummaryCard from '../components/StockSummaryCard';
import { summaryApi, StockSummaryItem } from '@/infrastructure/api/summaryApi';

type Tab = 'news' | 'report';

export default function DashboardPage() {
  const [summaries, setSummaries] = useState<StockSummaryItem[]>([]);
  const [reportSummaries, setReportSummaries] = useState<StockSummaryItem[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('news');
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneMessage, setDoneMessage] = useState<string | null>(null);
  const [progressMessages, setProgressMessages] = useState<string[]>([]);

  const fetchSummaries = async () => {
    setLoading(true);
    try {
      const [news, reports] = await Promise.all([
        summaryApi.getSummaries(),
        summaryApi.getReportSummaries(),
      ]);
      setSummaries(news);
      setReportSummaries(reports);
    } catch (e) {
      console.error('[summaries] fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  const handleRunPipeline = async () => {
    setRunning(true);
    setError(null);
    setDoneMessage(null);
    setProgressMessages([]);

    // 진행 상황 폴링 시작
    const pollInterval = setInterval(async () => {
      try {
        const progress = await summaryApi.getProgress();
        setProgressMessages(progress.messages);
      } catch {
        // ignore polling errors
      }
    }, 1500);

    try {
      await summaryApi.runPipeline();
      clearInterval(pollInterval);

      // 완료 후 최종 progress 한 번 더 읽기
      const finalProgress = await summaryApi.getProgress();
      setProgressMessages(finalProgress.messages);

      const [news, reports] = await Promise.all([
        summaryApi.getSummaries(),
        summaryApi.getReportSummaries(),
      ]);
      setSummaries(news);
      setReportSummaries(reports);
      const total = news.length + reports.length;
      if (total > 0) {
        setDoneMessage(`분석 완료 — 뉴스 ${news.length}건 · 공시·리포트 ${reports.length}건`);
      } else {
        setDoneMessage('분석이 완료됐지만 결과가 없습니다. 관심종목을 먼저 추가해주세요.');
      }
    } catch (e) {
      clearInterval(pollInterval);
      console.error('[pipeline] error:', e);
      setError((e as Error).message);
    } finally {
      setRunning(false);
    }
  };

  const displayItems = activeTab === 'news' ? summaries : reportSummaries;

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-10">

      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">대시보드</h1>
          <p className="text-sm text-gray-500 mt-1">관심종목 AI 요약</p>
        </div>
        <button
          onClick={handleRunPipeline}
          disabled={running}
          className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 transition-colors flex items-center gap-2"
        >
          {running && (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {running ? 'AI 분석 중...' : '최신 분석 실행'}
        </button>
      </header>

      {running && (
        <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-300 text-blue-700 rounded-lg dark:bg-blue-950 dark:border-blue-700 dark:text-blue-300">
          <p className="font-medium mb-2">뉴스·공시·재무리포트 수집 및 AI 분석 중...</p>
          {progressMessages.length > 0 && (
            <ul className="text-xs space-y-1 max-h-32 overflow-y-auto font-mono">
              {progressMessages.map((msg, i) => (
                <li key={i} className={msg.startsWith('✅') ? 'text-green-600 font-semibold' : ''}>
                  {msg}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {doneMessage && !running && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-300 text-green-700 rounded-lg dark:bg-green-950 dark:border-green-700 dark:text-green-300">
          {doneMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-300 text-red-700 rounded-lg">
          오류: {error}
        </div>
      )}

      {/* 탭 */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('news')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'news'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          뉴스 분석
          {summaries.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
              {summaries.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'report'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          공시·재무리포트
          {reportSummaries.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
              {reportSummaries.length}
            </span>
          )}
        </button>
      </div>

      <section>
        {loading ? (
          <p className="text-gray-500 py-8 text-center">불러오는 중...</p>
        ) : displayItems.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-4xl mb-4">
              {activeTab === 'report' ? '📊' : '📰'}
            </p>
            <p className="text-base font-medium text-gray-500">
              {activeTab === 'report' ? '재무리포트 분석 결과가 없습니다.' : '뉴스 분석 결과가 없습니다.'}
            </p>
            <p className="text-sm mt-2 text-gray-400">
              먼저{' '}
              <a href="/watchlist" className="text-blue-500 underline">관심종목</a>을 추가한 후
              &nbsp;&quot;최신 분석 실행&quot; 버튼을 눌러주세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayItems.map((stock) => {
              const fallbackUrl = stock.source_type === 'NEWS'
                ? `https://finance.naver.com/item/news.nhn?code=${stock.symbol}`
                : `https://dart.fss.or.kr/dsab001/main.do?textCrpNm=${encodeURIComponent(stock.name)}&currentPage=1&maxResults=15&sort=date&series=desc`;
              return (
                <StockSummaryCard
                  key={`${stock.symbol}-${stock.source_type}`}
                  symbol={stock.symbol}
                  name={stock.name}
                  summary={stock.summary}
                  tags={stock.tags}
                  sentiment={stock.sentiment}
                  sentiment_score={stock.sentiment_score}
                  confidence={stock.confidence}
                  url={stock.url || fallbackUrl}
                />
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
