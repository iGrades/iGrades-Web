import React from 'react'

type Props = {
    student: any;
    onClose: ()=> void
}

const EditGrader = ({onClose, student}: Props) => {
  return (
    <div>{student}</div>
  )
}

export default EditGrader