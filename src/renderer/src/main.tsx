import './assets/globals.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import RankingsPage from './pages/RankingsPage'
import NationSearchPage from './pages/NationSearchPage'
import NationOverviewPage from './pages/NationOverviewPage'
import NationFixturesPage from './pages/NationFixturesPage'
import CompetitionSearchPage from './pages/CompetitionSearchPage'
import CompetitionFinalsPage from './pages/CompetitionFinalsStage'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rankings" element={<RankingsPage />} />
          <Route path="/nation-search" element={<NationSearchPage />} />
          <Route path="/nation/:nationId" element={<NationOverviewPage />} />
          <Route path="/nation/:nationId/fixtures" element={<NationFixturesPage />} />
          <Route path="/competition-search" element={<CompetitionSearchPage />} />
          <Route path="/competition/:competitionId/:year" element={<CompetitionFinalsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </StrictMode>
)
