import React from 'react';
import { Form, Button } from '@douyinfe/semi-ui';

export default () => {
    return <Form labelPosition='top'>
        <Form.Select
            field="dataSource"
            label="数据源"
            placeholder="请选择数据源">
        </Form.Select>

        <Form.Select
            field="dataRange"
            label="数据范围"
            placeholder="请选择数据范围">
        </Form.Select>

        <Form.Select
            field="chartType"
            label="图表类型">
        </Form.Select>
            
        <Button type="primary" htmlType="submit" className="btn-margin-right">确定</Button>

    </Form>
}