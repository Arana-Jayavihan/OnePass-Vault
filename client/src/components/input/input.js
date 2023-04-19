import React from 'react'
import { Form } from 'react-bootstrap'

/**
* @author
* @function Input
**/

export const Input = (props) => {
  return(
    <Form.Group className="mb-3" >
        {props.label && <Form.Label>{props.label}</Form.Label>}
        <Form.Control 
            onKeyDown={props.onKeyDown ? props.onKeyDown : null}
            type={props.type} 
            placeholder={props.placeholder} 
            value={props.value}    
            onChange={props.onChange}
        />
        <Form.Text className="text-muted">
            {props.errMsg}
        </Form.Text>
    </Form.Group>
   )

 }