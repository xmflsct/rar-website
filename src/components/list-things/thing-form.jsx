import React, { useContext, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import MD5 from 'crypto-js/md5'

import { ContextBag } from '../../layouts/context-bag'

const ThingForm = ({ thing }) => {
  const { dispatch } = useContext(ContextBag)

  const [piece, setPiece] = useState(0)
  const [whole, setWhole] = useState(0)

  const onSubmit = e => {
    e.preventDefault()
    if (piece !== 0 || whole !== 0) {
      dispatch({
        type: 'add',
        data: {
          hash: MD5(new Date().getTime() + thing.contentful_id).toString(),
          contentful_id: thing.contentful_id,
          name: thing.name,
          amountPiece: parseInt(piece),
          amountWhole: parseInt(whole),
          pricePiece: thing.pricePiece,
          priceWhole: thing.priceWhole,
          wholeIdentity: thing.wholeIdentity,
          image: thing.image
        }
      })
    }
  }
  return (
    <Form onSubmit={e => onSubmit(e)}>
      <Form.Group>
        {thing.pricePiece && (
          <Form.Control
            as='select'
            name='piece'
            onChange={e => setPiece(e.target.value)}
          >
            <option value={0}>0 Piece</option>
            <option value={1}>1 Piece</option>
            <option value={2}>2 Piece</option>
            <option value={3}>3 Piece</option>
            <option value={4}>4 Piece</option>
            <option value={5}>5 Piece</option>
          </Form.Control>
        )}
      </Form.Group>
      <Form.Group>
        {thing.priceWhole && (
          <Form.Control
            as='select'
            name='whole'
            onChange={e => setWhole(e.target.value)}
          >
            <option value={0}>0 {thing.wholeIdentity}</option>
            <option value={1}>1 {thing.wholeIdentity}</option>
            <option value={2}>2 {thing.wholeIdentity}</option>
            <option value={3}>3 {thing.wholeIdentity}</option>
            <option value={4}>4 {thing.wholeIdentity}</option>
            <option value={5}>5 {thing.wholeIdentity}</option>
          </Form.Control>
        )}
      </Form.Group>
      <Button variant='rar' type='submit'>
        Add to bag
      </Button>
    </Form>
  )
}

export default ThingForm
