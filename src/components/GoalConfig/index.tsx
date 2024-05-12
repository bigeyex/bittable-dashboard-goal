import React, { useCallback, useEffect, useState } from 'react';
import { FieldType, IDataRange, IField, ITable, SourceType, base } from '@lark-base-open/js-sdk';
import { Form, Button, Divider, Select, useFieldApi } from '@douyinfe/semi-ui';
import { TriggerRenderProps } from '@douyinfe/semi-ui/lib/es/select';
import { IconChevronDown } from '@douyinfe/semi-icons';
import { DashboardState, bitable, dashboard } from "@lark-base-open/js-sdk";
import '@semi-bot/semi-theme-feishu-bittable-dashboard/semi.min.css'
import './style.scss'

export default () => {
    type TableInfo = {tableId: string, tableName: string}
    const [tableList, setTableList] = useState<TableInfo[]>([])
    const [tableDataRange, setTableDataRange] = useState<IDataRange[]>([])
    type NumberFieldInfo = {fieldId: string, fieldName: string}
    const [numberFieldList, setNumberFieldList] = useState<NumberFieldInfo[]>([])
    
    const emptyDefaultValueSetter = (value: string) => {}
    let setDefaultValues = {
        dataSource: emptyDefaultValueSetter,
        dataRange: emptyDefaultValueSetter,
        currentValueAggField: emptyDefaultValueSetter
    }

    const getTableList = useCallback(async () => {
        const tables = await bitable.base.getTableList();
        return await Promise.all(tables.map(async table => {
          const name = await table.getName();
          return {
            tableId: table.id,
            tableName: name
          }
        }))
      }, [])
    
    const getTableRange = useCallback((tableId: string) => {
        return dashboard.getTableDataRange(tableId);
    }, [])

    const fetchInitData = async() => {
        const tableListData = await getTableList();
        setTableList(tableListData);
        if (tableListData.length > 0) {
            const dataRange = await getTableRange(tableListData[0].tableId)
            setTableDataRange(dataRange)
            setDefaultValues.dataSource(tableListData[0].tableId)
            setDefaultValues.dataRange(JSON.stringify(dataRange[0]))
        }
    }
    useEffect(() => {
        fetchInitData()
    }, [])

    const onDataSourceChange = async (tableId:string) => {
        const dataRange = await getTableRange(tableId)
        setTableDataRange(dataRange)
        const table = await base.getTableById(tableId)
        const numberFields = await table.getFieldListByType(FieldType.Number)
        const numberFieldsInfo =  await Promise.all(numberFields.map(async field => {
            const name = await field.getName();
            return {
                fieldId: field.id,
                fieldName: name
            }
        }))
        setNumberFieldList(numberFieldsInfo)
        if(numberFieldsInfo.length > 0) {
            setDefaultValues.currentValueAggField(numberFieldsInfo[0].fieldId)
        }
        
    }

    const DefaultValueSetter = () => {
        const dataRangeFieldApi = useFieldApi('dataRange')
        const dataSourceFieldApi = useFieldApi('dataSource')
        const currentValueAggFieldApi = useFieldApi('currentValueAggField')
        setDefaultValues.dataSource = (value: string) => { dataSourceFieldApi.setValue(value) }
        setDefaultValues.dataRange = (value: string) => { dataRangeFieldApi.setValue(value) }
        setDefaultValues.currentValueAggField = (value: string) => { currentValueAggFieldApi.setValue(value) }
        return '';
    }

    return <Form labelPosition='top' className='configForm'>

        <Form.Select field="dataSource" label="数据源" placeholder="请选择数据源" 
            onChange={value => {onDataSourceChange(value as string)}}
            optionList={tableList.map(source => ({
                value: source.tableId,
                label: source.tableName
              }))} ></Form.Select>

        <Form.Select field="dataRange" label="数据范围" placeholder="请选择数据范围" 
                // onChange={handleDataRangeChange}
                optionList={tableDataRange.map(range => {
                  const { type } = range;
                  if (type === SourceType.ALL) {
                    return {
                      value: JSON.stringify(range),
                      label: '全部数据'
                    }
                  } else {
                    return {
                      value: JSON.stringify(range),
                      label: range.viewName
                    }
                  }
                })}></Form.Select>

        <Form.Select field="chartType" label="图表形状">
            <Select.Option>条形</Select.Option>
            <Select.Option>半环</Select.Option>
            <Select.Option>环形</Select.Option>
        </Form.Select>

        <Form.RadioGroup field="color" label="颜色" initValue='green' type='pureCard' direction='horizontal' className='colorPicker'> 
            <Form.Radio value="green" style={{backgroundColor: 'rgb(53,199,36)'}}></Form.Radio>
            <Form.Radio value="blue" style={{backgroundColor: 'rgb(22,192,255)'}}></Form.Radio>
            <Form.Radio value="yellow" style={{backgroundColor: 'rgb(255,198,12)'}}></Form.Radio>
        </Form.RadioGroup>

        <Divider/>

        <Form.Input field="targetValue" label="目标值" initValue={100}></Form.Input>

        <Form.InputGroup label={{ text: "当前值" }} className='currentValueLabelGroup'>
            <Form.Select field="currentValueField">
                <Select.Option>统计字段总数</Select.Option>
                <Select.Option>统计字段数值</Select.Option>
            </Form.Select>
            <Form.Select field="currentValueAggMethod" className='currentValueAggMethod' triggerRender={triggerRenderBorderless}>
                <Select.Option>求和</Select.Option>
                <Select.Option>平均值</Select.Option>
            </Form.Select>
            <Form.Select field="currentValueAggField" 
                    optionList={ numberFieldList.map(fieldInfo => ({value: fieldInfo.fieldId, label: fieldInfo.fieldName}) )}>
            </Form.Select>
        </Form.InputGroup>

        <Form.InputGroup label={{ text: "单位" }} className='fieldUnit'>
            <Form.Input field="unitSign" initValue="$" className='unitSymbol'></Form.Input>
            <Form.RadioGroup type="button" field="unitPosition" initValue="left" className="unitPosition">
                <Form.Radio value="left">左</Form.Radio>
                <Form.Radio value="right">右</Form.Radio>
            </Form.RadioGroup>
        </Form.InputGroup>

        <Form.InputGroup label={{ text: "格式" }} className='fieldNumericFormat'>
            <Form.Select field="numericFormat">
                <Select.Option>整数</Select.Option>
                <Select.Option>保留1位小数</Select.Option>
                <Select.Option>保留2位小数</Select.Option>
            </Form.Select>
            <Form.Checkbox field="numericAbbrKilos" >千位缩写</Form.Checkbox>

        </Form.InputGroup>

            
        <div className='configActionButton'>
            <Button type="primary" htmlType="submit" className="btn-margin-right">确定</Button>
        </div>
        
        <DefaultValueSetter/>
    </Form>
}


const triggerRenderBorderless = ({ value, ...rest }:TriggerRenderProps) => {
    return (
        <div
            style={{
                minWidth: '112',
                height: 32,
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 8,
                borderRadius: 3,
            }}
        >
            <div
                style={{
                    margin: 4,
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    flexGrow: 1,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                {value.map(item => item.label).join(' , ')}
                <IconChevronDown style={{ margin: '0 8px', flexShrink: 0 }} />
            </div>
        </div>
    );
};