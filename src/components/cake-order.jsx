import React, { useContext, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import MD5 from 'crypto-js/md5'

import { ContextBag } from '../layouts/context-bag'

const CakeOrder = ({ cake }) => {
  const { dispatch } = useContext(ContextBag)

  const [typeASelected, setTypeASelected] = useState()
  const [typeBSelected, setTypeBSelected] = useState()
  const [typeCSelected, setTypeCSelected] = useState()
  const [customizationBirthdayCake, setCustomizationBirthdayCake] = useState({})
  const [customizationShipping, setCustomizationShipping] = useState({})

  const TypeSelection = (type, unit) => (
    <Form.Group>
      <Form.Control
        as='select'
        name={unit}
        onChange={e => {
          switch (type) {
            case 'A':
              setTypeASelected(e.target.value)
              break
            case 'B':
              setTypeBSelected(e.target.value)
              break
            case 'C':
              setTypeCSelected(e.target.value)
              break
            default:
              break
          }
        }}
      >
        <option value={0}>{unit}</option>
        <option value={1}>1 × {unit}</option>
        <option value={2}>2 × {unit}</option>
        <option value={3}>3 × {unit}</option>
        <option value={4}>4 × {unit}</option>
        <option value={5}>5 × {unit}</option>
        <option value={6}>6 × {unit}</option>
        <option value={7}>7 × {unit}</option>
        <option value={8}>8 × {unit}</option>
        {/* <option value={9}>9 × {unit}</option>
        <option value={10}>10 × {unit}</option>
        <option value={11}>11 × {unit}</option>
        <option value={12}>12 × {unit}</option>
        <option value={13}>13 × {unit}</option>
        <option value={14}>14 × {unit}</option>
        <option value={15}>15 × {unit}</option> */}
      </Form.Control>
    </Form.Group>
  )

  const onSubmit = e => {
    e.preventDefault()
    if (typeASelected || typeBSelected || typeCSelected) {
      dispatch({
        type: 'add',
        data: {
          type: 'cake',
          hash: MD5(new Date().getTime() + cake.contentful_id).toString(),
          contentful_id: cake.contentful_id,
          image: cake.image,
          name: cake.name,
          typeAPrice: cake.typeAPrice,
          typeAUnit: cake.typeAUnit,
          typeAAmount: parseInt(typeASelected),
          typeBPrice: cake.typeBPrice,
          typeBUnit: cake.typeBUnit,
          typeBAmount: parseInt(typeBSelected),
          typeCPrice: cake.typeCPrice,
          typeCUnit: cake.typeCUnit,
          typeCAmount: parseInt(typeCSelected),
          ...(cake.customizationBirthdayCake && { customizationBirthdayCake }),
          ...(cake.customizationShipping && {
            customizationShipping: JSON.parse(customizationShipping)
          })
        }
      })
    }
  }
  return (
    <Form onSubmit={e => onSubmit(e)} className='cake-order'>
      {cake.customizationShipping ? (
        <>
          <Form.Group>
            <Form.Control
              as='select'
              name='type'
              defaultValue=''
              required
              onChange={e => setCustomizationShipping(e.target.value)}
            >
              <option value='' disabled>
                Select shipping
              </option>
              <option
                value={JSON.stringify({
                  name: 'Free: Pick-up in Store',
                  price: 0
                })}
              >
                Free: Pick-up in Store
              </option>
              {cake.customizationShipping.map(shipping => (
                <option
                  key={shipping.contentful_id}
                  value={JSON.stringify(shipping)}
                >
                  €{shipping.price}: {shipping.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </>
      ) : null}
      {cake.customizationBirthdayCake ? (
        <>
          <Form.Group>
            <Form.Control
              as='select'
              name='type'
              defaultValue=''
              required
              onChange={e => {
                switch (e.target.value) {
                  case 'A':
                    setTypeASelected(1)
                    setTypeBSelected(null)
                    setTypeCSelected(null)
                    break
                  case 'B':
                    setTypeASelected(null)
                    setTypeBSelected(1)
                    setTypeCSelected(null)
                    break
                  case 'C':
                    setTypeASelected(null)
                    setTypeBSelected(null)
                    setTypeCSelected(1)
                    break
                  default:
                    break
                }
              }}
            >
              <option value='' disabled>
                Select size
              </option>
              {cake.typeAUnit ? (
                <option value='A'>1 × {cake.typeAUnit.typeUnit}</option>
              ) : (
                ''
              )}
              {cake.typeBUnit ? (
                <option value='B'>1 × {cake.typeBUnit.typeUnit}</option>
              ) : (
                ''
              )}
              {cake.typeCUnit ? (
                <option value='C'>1 × {cake.typeCUnit.typeUnit}</option>
              ) : (
                ''
              )}
            </Form.Control>
          </Form.Group>
          {cake.customizationBirthdayCake.map(customization => (
            <Form.Group key={customization.type}>
              <Form.Control
                as='select'
                name={customization.type}
                defaultValue=''
                required
                onChange={e => {
                  e.target.value &&
                    setCustomizationBirthdayCake({
                      ...customizationBirthdayCake,
                      [customization.type]: e.target.value
                    })
                }}
              >
                <option value='' disabled>
                  Select {customization.type}
                </option>
                {customization.options.map(option => (
                  <option key={option} value={option}>
                    {customization.type}: {option}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          ))}
        </>
      ) : (
        <>
          {cake.typeAPrice &&
            TypeSelection(
              'A',
              cake.typeAUnit ? cake.typeAUnit.typeUnit : 'Unit'
            )}
          {cake.typeBPrice &&
            TypeSelection(
              'B',
              cake.typeBUnit ? cake.typeBUnit.typeUnit : 'Unit'
            )}
          {cake.typeCPrice &&
            TypeSelection(
              'C',
              cake.typeCUnit ? cake.typeCUnit.typeUnit : 'Unit'
            )}
        </>
      )}
      <Button variant='rar' type='submit'>
        Add to bag
      </Button>
    </Form>
  )
}

export default CakeOrder
