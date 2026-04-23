import './App.css'
import { Header, Dashboard } from './components'

function App() {
  return (
    <div className="app-shell">
      <div className="app-bg" />
      <Header />
      <main className="app-content">
        <Dashboard />
      </main>
    </div>
  )
}

export default App
