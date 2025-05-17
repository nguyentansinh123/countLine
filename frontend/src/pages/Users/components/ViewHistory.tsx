import React from 'react'
import GeneralLayout from '../../../components/General_Layout/GeneralLayout'
import ListComponents from '../../../components/listComponents/listComponents'
import userHistory from '../const/userHistory'
import { MenuProps } from 'antd'

const ViewHistory = () => {
  return (
    <GeneralLayout title='User History' >
    <ListComponents column={['name','activity','data','date','time']} data={userHistory}/>
        </GeneralLayout>
  )
}

export default ViewHistory