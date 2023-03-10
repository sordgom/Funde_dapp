import 'regenerator-runtime/runtime'
import { useEffect, useState } from 'react'
import ListCrowdfunds from './components/ListCrowdfunds'
import CreateCrowdfund from './components/CreateCrowdfunds'
import React from 'react'
import { login, logout } from './utils'
import './global.css'

import getConfig from './config'

const { networkId } = getConfig(process.env.NODE_ENV || 'development')

export default function App() {
  // use React Hooks to store greeting in component state
  const [crowdfunds, setCrowdfunds] = useState([])
  const [toggleModal, setToggleModal] = useState(false)


  function addProject() {
    setToggleModal(!toggleModal)
  }

  // The useEffect hook can be used to fire side-effects during render
  // Learn more: https://reactjs.org/docs/hooks-intro.html
  useEffect(
    () => {
      // in this case, we only care to query the contract when signed in
      if (window.walletConnection.isSignedIn() && crowdfunds.length === 0) {
        // window.contract is set by initContract in index.js
        window.contract.get_campaigns().then((crowdfundprojects) => {
          const crowdfundList = [...crowdfundprojects]
          setCrowdfunds(crowdfundList)
        })
      }
    },

    // The second argument to useEffect tells React when to re-run the effect
    // Use an empty array to specify "only run on first render"
    // This works because signing into NEAR Wallet reloads the page
    [crowdfunds],
  )

  // if not signed in, return early with sign-in prompt
  if (!window.walletConnection.isSignedIn()) {
    return (
      <main className='signin'>
        <h1>Welcome to Funde</h1>
        <p style={{ textAlign: 'center' }}>
          Click the button below to sign in:
        </p>
        <p style={{ textAlign: 'center', marginTop: '2.5em' }}>
          <button onClick={login}>Sign in</button>
        </p>
      </main>
    )
  }

  return (
    // use React Fragment, <>, to avoid wrapping elements in unnecessary divs
    <>

      <header>
        <div className="logo"></div>
        <button className="link" style={{ float: 'right' }} onClick={logout}>
          Sign out <span className="id">{window.accountId}</span>
        </button>
      </header>
      <button onClick={addProject}>Add a Campaign</button>
      <main>
        <CreateCrowdfund toggleModal={toggleModal} />
        <section className='crowdfunds'>
          {crowdfunds.map((project, id) => {
            return (
              <div key={id}>
                <ListCrowdfunds project={project} />
              </div>
            )
          })}
        </section>
      </main>
    </>
  )
}
