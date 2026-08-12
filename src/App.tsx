import './App.css'
import { useState } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { WorkspaceProvider } from './contexts/WorkspaceContext'
import { ReleaseProvider } from './contexts/ReleaseContext'
import { DirtyStateProvider } from './contexts/DirtyStateContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { PCAProvider } from './contexts/PCAContext'
import Shell from './components/Shell'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import WorkspaceSelectionPage from './pages/WorkspaceSelectionPage'
import Audience from './pages/Audience'
import Users from './pages/Users'
import Groups from './pages/Groups'
import ContentAccess from './pages/ContentAccess'
import FeatureAccess from './pages/FeatureAccess'
import HomePage from './pages/HomePage'
import Navigation from './pages/Navigation'
import Theme from './pages/Theme'
import DiagramPage from './pages/DiagramPage'
import FactSheet from './pages/FactSheet'
import HelpResources from './pages/HelpResources'
import AttributeVisualization from './pages/AttributeVisualization'
import Collaboration from './pages/Collaboration'
import ApprovalWorkflows from './pages/ApprovalWorkflows'
import ProcessRating from './pages/ProcessRating'
import ProcessInsights from './pages/ProcessInsights'
import CloudALM from './pages/CloudALM'
import WalkMe from './pages/WalkMe'
import AccessConfiguration from './pages/AccessConfiguration'
import DataSharingIndustry from './pages/DataSharingIndustry'
import DataCollectionConfig from './pages/DataCollectionConfig'
import DataPrivacyManagement from './pages/DataPrivacyManagement'
import WorkspaceDetails from './pages/WorkspaceDetails'
import ModelingPreferences from './pages/ModelingPreferences'
import ModelingLanguages from './pages/ModelingLanguages'
import ModelingLanguageAppearance from './pages/ModelingLanguageAppearance'
import Authentication from './pages/Authentication'
import NetworkPrivacy from './pages/NetworkPrivacy'
import AssetTypes from './pages/AssetTypes'
import AssetTypeDetail from './pages/AssetTypeDetail'
import DictionaryCategories from './pages/DictionaryCategories'
import DictionaryCategoryDetail from './pages/DictionaryCategoryDetail'
import AttributeDefinitions from './pages/AttributeDefinitions'
import Repository from './pages/Repository'
import SearchResults from './pages/SearchResults'
import Reporting from './pages/Reporting'
import HomeDashboard from './pages/HomeDashboard'
import AllResources from './pages/AllResources'
import Recent from './pages/Recent'
import Favorites from './pages/Favorites'
import Newsfeed from './pages/Newsfeed'
import SmartFolder from './pages/SmartFolder'
import TrashPage from './pages/TrashPage'
import VariantManagement from './pages/VariantManagement'
import ModelingConventions from './pages/ModelingConventions'
import ProcessConsultingAgent from './pages/ProcessConsultingAgent'
import ProcessLandscape from './pages/ProcessLandscape'
import ObjectivesPage from './pages/ObjectivesPage'
import InitiativesPage from './pages/InitiativesPage'
import InitiativeDetailPage from './pages/InitiativeDetailPage'
import InsightsPage from './pages/InsightsPage'
import ConventionsStandalone from './pages/ConventionsStandalone'
import JourneyModelerLayout from './pages/JourneyModelerLayout'
import ModelerLobby from './pages/ModelerLobby'
import ModelerLayout from './pages/ModelerLayout'
import { ValueAcceleratorLibrary } from './pages/ValueAccelerator/ValueAcceleratorLibrary'
import TemplatesShell from './templates/TemplatesShell'
import TemplatesIndex from './templates/TemplatesIndex'
import TemplateSettingsPage from './templates/pages/TemplateSettingsPage'
import TemplateSettingsPageWide from './templates/pages/TemplateSettingsPageWide'
import TemplateTableSettingsPage from './templates/pages/TemplateTableSettingsPage'
import TemplateTableSettingsPageWide from './templates/pages/TemplateTableSettingsPageWide'
import TemplateTabbedPage from './templates/pages/TemplateTabbedPage'
import TemplateTwoColumnPage from './templates/pages/TemplateTwoColumnPage'
import TemplateTwoColumnPagePanel from './templates/pages/TemplateTwoColumnPagePanel'
import TemplateSideNavPage from './templates/pages/TemplateSideNavPage'
import TemplateSideNavPageWide from './templates/pages/TemplateSideNavPageWide'

function AuthGate() {
  const { isLoggedIn, workspaceSelected } = useAuth()
  const [showRegister, setShowRegister] = useState(false)

  if (!isLoggedIn) {
    if (showRegister) return <RegisterPage onBackToLogin={() => setShowRegister(false)} />
    return <LoginPage onRegister={() => setShowRegister(true)} />
  }
  if (!workspaceSelected) return <WorkspaceSelectionPage />
  return (
    <Routes>
        <Route path="conventions-standalone" element={<ConventionsStandalone />} />
        <Route path="templates" element={<TemplatesShell />}>
          <Route index element={<TemplatesIndex />} />
          <Route path="settings" element={<TemplateSettingsPage />} />
          <Route path="settings-wide" element={<TemplateSettingsPageWide />} />
          <Route path="table-settings" element={<TemplateTableSettingsPage />} />
          <Route path="table-settings-wide" element={<TemplateTableSettingsPageWide />} />
          <Route path="tabbed" element={<TemplateTabbedPage />} />
          <Route path="two-column" element={<TemplateTwoColumnPage />} />
          <Route path="two-column-panel" element={<TemplateTwoColumnPagePanel />} />
          <Route path="side-nav" element={<TemplateSideNavPage />} />
          <Route path="side-nav-wide" element={<TemplateSideNavPageWide />} />
        </Route>
        <Route path="/" element={<PCAProvider><Shell /></PCAProvider>}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="audience" element={<Audience />} />
          <Route path="users" element={<Users />} />
          <Route path="groups" element={<Groups />} />
          <Route path="resource-access" element={<ContentAccess />} />
          <Route path="feature-access" element={<FeatureAccess />} />
          <Route path="home-page" element={<HomePage />} />
          <Route path="general-settings" element={<WorkspaceDetails />} />
          <Route path="navigation" element={<Navigation />} />
          <Route path="theme" element={<Theme />} />
          <Route path="diagram-page" element={<DiagramPage />} />
          <Route path="fact-sheet" element={<FactSheet />} />
          <Route path="help-resources" element={<HelpResources />} />
          <Route path="attribute-visualization" element={<AttributeVisualization />} />
          <Route path="collaboration" element={<Collaboration />} />
          <Route path="journey-model-approval" element={<ApprovalWorkflows />} />
          <Route path="process-rating" element={<ProcessRating />} />
          <Route path="walkme" element={<WalkMe />} />
          <Route path="access-configuration" element={<AccessConfiguration />} />
          <Route path="data-sharing-industry" element={<DataSharingIndustry />} />
          <Route path="data-collection-config" element={<DataCollectionConfig />} />
          <Route path="data-privacy-management" element={<DataPrivacyManagement />} />
          <Route path="process-insights" element={<ProcessInsights />} />
          <Route path="cloud-alm" element={<CloudALM />} />
          <Route path="modeling-preferences" element={<ModelingPreferences />} />
          <Route path="modeling-languages" element={<ModelingLanguages />} />
          <Route path="modeling-languages/:langId" element={<ModelingLanguageAppearance />} />
          <Route path="authentication" element={<Authentication />} />
          <Route path="network-privacy" element={<NetworkPrivacy />} />
          <Route path="repository" element={<Repository />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="reporting" element={<Reporting />} />
          <Route path="asset-types" element={<AssetTypes />} />
          <Route path="asset-types/:id" element={<AssetTypeDetail />} />
          <Route path="dictionary-categories" element={<DictionaryCategories />} />
          <Route path="dictionary-categories/:id" element={<DictionaryCategoryDetail />} />
          <Route path="attribute-definitions" element={<AttributeDefinitions />} />
          <Route path="home" element={<HomeDashboard />} />
          <Route path="all-resources" element={<AllResources />} />
          <Route path="recent" element={<Recent />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="newsfeed" element={<Newsfeed />} />
          <Route path="smart-folder" element={<SmartFolder />} />
          <Route path="trash" element={<TrashPage />} />
          <Route path="variant-management" element={<VariantManagement />} />
          <Route path="modeling-conventions" element={<ModelingConventions />} />
          <Route path="process-consulting-agent" element={<ProcessConsultingAgent />} />
          <Route path="process-landscape" element={<ProcessLandscape />} />
          <Route path="objectives" element={<ObjectivesPage />} />
          <Route path="initiatives" element={<InitiativesPage />} />
          <Route path="initiatives/:id" element={<InitiativeDetailPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="modeler" element={<ModelerLobby />} />
          <Route path="modeler/new-journey" element={<JourneyModelerLayout />} />
          <Route path="modeler/:assetId" element={<ModelerLayout />} />
          <Route path="value-accelerator" element={<ValueAcceleratorLibrary />} />
        </Route>
      </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
    <ReleaseProvider>
    <DirtyStateProvider>
    <WorkspaceProvider>
      <HashRouter>
        <AuthGate />
      </HashRouter>
    </WorkspaceProvider>
    </DirtyStateProvider>
    </ReleaseProvider>
    </AuthProvider>
  )
}
