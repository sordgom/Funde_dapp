import React, { useState, useEffect } from 'react'
import { utils } from 'near-api-js'

function CreateCrowdfund({toggleModal}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [goal, setGoal] = useState(0)
  const [startAt, setStartAt] = useState(0)
  const [endAt, setEndAt] = useState(0)
  const [showNotification, setShowNotification] = useState(false)
  const [isChecked, setIsChecked] = useState(false);
  const [isTierChosen, setIsTierChosen] = useState(false);

  const [nft, setNft] = useState({
    token_id: '',
    title: '',
    description: '',
    image: ''
  })

  const [tier, setTier] = useState({
    tier_1: 0,
    tier_2: 0,
    tier_3: 0,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    switch(name) {
      default:
        setNft({
          ...nft,
          [name]: value
        })
        break
    }
  }

  const handleTierChange = (e) => {
    const { name, value } = e.target
    switch(name) {
      default:
        setTier({
          ...tier,
          [name]: value
        })
        break
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    window.contract.launch({
      title: title, 
      description: description, 
      goal:goal, 
      startAt: startAt , 
      endAt :endAt,
      tier_1: tier.tier_1,
      tier_2: tier.tier_2,
      tier_3: tier.tier_3,
    })
    let deposit = utils.format.parseNearAmount("0.1")
    if(nft.token_id!=""){
      window.nft_contract.nft_mint({
        args: {
          token_id: nft.token_id, 
          metadata: { 
            title: nft.title, 
            description: nft.description, 
            media: nft.image
          },
          receiver_id: window.accountId
        },
        gas: 300000000000000, 
        amount: deposit,
        accountId: window.accountId 
      })
    }
    setShowNotification(!showNotification)
    alert(`crowdfund info: ${title} ${goal} ${description}`)
  }

  useEffect(() => {
    console.log(tier)
  },[tier])
  return (
    <div>
      {toggleModal == true && (
        <div className='addcrowdfund'>
          <form onSubmit={handleSubmit}>
            <label>
              Enter project title:
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label>
              Enter the amount you want to raise:
              <input
                type="number"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </label>
            <label>
              Enter project description:
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <label>
              Enter the start date:
              <input
                type="date"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
            </label>
            <label>
              Enter the end date:
              <input
                type="date"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
              />
            </label>
            <label>
              Do you want to attach an nft with your campaign?
              <input type="checkbox" onClick={() => setIsChecked(!isChecked)} />
            </label>
            {isChecked && 
              <div>
                <label>
                  Token-id:
                  <input
                    type="text"
                    name="token_id"
                    value={nft.token_id}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Nft Title:
                  <input
                    type="text"
                    name="title"
                    value={nft.title}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Nft description:
                  <input
                    type="text"
                    name="description"
                    value={nft.description}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Nft image:
                  <input
                    type="text"
                    name="image"
                    value={nft.image}
                    onChange={handleChange}
                  />
                </label>
              </div>
            }
            <label>
              Do you want to add rewards and incentives?
              <input type="checkbox" onClick={() => setIsTierChosen(!isTierChosen)} />
            </label>
            {isTierChosen && 
              <div>
                <label>
                  Tier-1:
                  <input
                    type="number"
                    name="tier_1"
                    value={tier.tier_1}
                    placeholder="5% of pledged amount"
                    onChange={handleTierChange}
                  />
                </label>
                <label>
                  Tier-2:
                  <input
                    type="number"
                    name="tier_2"
                    value={tier.tier_2}
                    placeholder="10% of pledged amount + 0.1"
                    onChange={handleTierChange}
                  />
                </label>
                <label>
                  Tier-3:
                  <input
                    type="number"
                    name="tier_3"
                    value={tier.tier_3}
                    placeholder="15% of pledged amount + 0.2"
                    onChange={handleTierChange}
                  />
                </label>
              </div>
            }
            <input type="submit" className='submit' />
          </form>
        </div>
      )}
      
      {showNotification && <Notification />}
    </div>
    
  )
}
function Notification() {
  return (
    <aside>
      <footer>
        <div>✔ Succeeded </div> 
        <div>Added new project Just now</div>
      </footer>
    </aside>
  )
}

export default CreateCrowdfund
