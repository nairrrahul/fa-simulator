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
        </Routes>
      </Layout>
    </BrowserRouter>
  </StrictMode>
)
