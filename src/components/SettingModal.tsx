import { Form, Input, Modal } from "antd"
import { Dispatch, SetStateAction, useState } from "react";

interface Props {
  setSetShow: Dispatch<SetStateAction<boolean>>
  setKey: Dispatch<SetStateAction<string>>
}

export default function SettingForm({ setSetShow, setKey }: Props) {
  const [form] = Form.useForm()
  const handleOk = () => {
    setKey(form.getFieldValue('key'))
    setSetShow(false)
  }

  const handleCancel = () => {
    setSetShow(false)
  }

  return <Modal
    open
    title="设置"
    okText="确认"
    cancelText="取消"
    onOk={handleOk}
    onCancel={handleCancel}
  >
    <Form
      name="setting"
      form={form}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      style={{ maxWidth: 600 }}
      initialValues={{ remember: true }}
      autoComplete="off"
    >
      <Form.Item name="key" label="OPEN_AI_KEY" >
        <Input placeholder='请输入你的CHATGPT的KEY' />
      </Form.Item>
    </Form>
  </Modal>
}