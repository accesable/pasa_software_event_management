import { useModalForm } from '@refinedev/antd';
import { useGo } from '@refinedev/core'
import { Form, Input, Modal } from 'antd';
import React from 'react'

const CreateEvent = () => {

    const go = useGo();
    const goToListPage = () => {
        go({
            to : {resource : 'events', action :'list'},
            options : {keepQuery : true},
            type :'replace',
        })
    }
    const {formProps,modalProps} = useModalForm({
        action: 'create',
        defaultVisible : true,
        resource : 'events',
        redirect : false,
        mutationMode : 'pessimistic',
        onMutationSuccess : goToListPage,
    })
  return (
    <div>
        <Modal
        {...modalProps}
        mask={true}
        onCancel={goToListPage}
        title="Create Event"
        width={521}>
            <Form
              {...formProps}
              layout='vertical'
            >
                <Form.Item
                    label="Event Name"
                    name="name"
                    rules={[{required : true}]}
                >
                    <Input placeholder='Please enter event name'/>
                </Form.Item>
            </Form>

        </Modal>
    </div>
  )
}

export default CreateEvent