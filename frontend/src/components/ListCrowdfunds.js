import React, { useState } from 'react'
import { utils } from 'near-api-js'

const ONE_NEAR = 1_000_000_000_000_000_000_000_000

function ListCrowdfunds({ project }) {
  const [donationAmount, setDonationAmount] = useState(0)
  const [showDonateNotification, setShowDonateNotification] = useState(false)
  const [factor, setFactor] = useState(0)
  console.log(project)

  function pledge(e) {
    e.preventDefault()
    let deposit = utils.format.parseNearAmount((donationAmount*(1+factor/100)).toString())
    window.contract.pledge({
      args: { id: project.id },
      gas: 300000000000000, 
      amount: deposit 
    })     
    setShowDonateNotification(!showDonateNotification)
  }

  function cancel(e) {
    e.preventDefault()
    if( window.accountId != project.creator) {
      alert("You are not the owner of this project")
      return
    }
    window.contract.cancel({
      args: { id: project.id }
    })     
    setShowDonateNotification(!showDonateNotification)
  }

  function claim(e) {
    e.preventDefault()
    if( window.accountId != project.creator) {
      alert("You are not the owner of this project")
      return
    }
    if(project.pledged/ONE_NEAR < project.goal) {
      alert("The project has not reached its goal")
      return
    }
    window.contract.claim({
      id: project.id 
    }).then((res) => {
      alert(`You claimed ${res}`)
    })
    setShowDonateNotification(!showDonateNotification)
  }
  
  return (
    <div className="project">
      <h3>Owner: </h3>
      <h3 className="creator">{project.creator}</h3>
      <h3>Title: {project.title}</h3>
      <h4>target: {project.goal} NEAR</h4>
      <h4>total pledged: {parseInt(project.pledged / ONE_NEAR * 100)/100} NEAR</h4>
      <h4>Tier 1: {project.tier_1} %</h4>
      <h4>Tier 2: {project.tier_2} %</h4>
      <h4>Tier 3: {project.tier_3} %</h4>
      <select onChange={(e) => setFactor(e.target.value)}>
        <option value={project.tier_1}>Tier 1</option>
        <option value={project.tier_2}>Tier 2</option>
        <option value={project.tier_3}>Tier 3</option>
      </select>
      <form onSubmit={pledge}>
        <input
          type="number"
          value={donationAmount}
          onChange={(e) => setDonationAmount(e.target.value)}
        ></input>
        <button onClick={pledge} disabled={project.claimed}>Pledge</button>
      </form>
      <form onSubmit={claim}>
        <button onClick={claim} disabled={project.claimed}>Claim</button>
      </form>
      <form onSubmit={cancel}>
        <button onClick={cancel}>Cancel</button>
      </form>
      {showDonateNotification && <DonateNotification />}
    </div>
  )
}

function DonateNotification() {
  return (
    <aside>
      <footer>
        <div>✔ Succeeded </div>
        <div>Donation was successful</div>
      </footer>
    </aside>
  )
}

export default ListCrowdfunds
