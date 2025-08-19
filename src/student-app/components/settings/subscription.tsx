import React from 'react'

type Props = {}

const Subscription = (props: Props) => {

  const subPlans = [
    {
      type: "Basic",
      desc: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nesciunt ex tempora quos? Dolore ratione incidunt eius",
      price: 'Zero fee',
      btnText: 'Activated'
    },
  ];
  return (
    <div>subscription Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nesciunt ex tempora quos? Dolore ratione incidunt eius eum quisquam magnam velit cumque voluptatibus natus. Rerum, delectus impedit facilis at asperiores et!</div>
  )
}

export default Subscription