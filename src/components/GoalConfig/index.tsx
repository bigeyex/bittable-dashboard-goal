import React, { useCallback, useEffect, useState } from 'react';
import { FieldType, IDataRange, IField, ITable, SourceType, base } from '@lark-base-open/js-sdk';
import { Form, Button, Divider, Select, useFieldApi, useFormApi } from '@douyinfe/semi-ui';
import IconFormular from '/src/assets/icons/icon-formular.svg?react'
import IconMore from '/src/assets/icons/icon-more.svg?react'
import { DashboardState, bitable, dashboard } from "@lark-base-open/js-sdk";
import '../../assets/semi-feishu-custom.min.css'
import './style.scss'
import config, { ConfigPayload, ConfigState, loadConfig, saveConfig, setConfigState, updatePreviewData } from '../../store/config';
import { useAppDispatch, useAppSelector } from '../../store/hook';
import { themeColors } from '../common';

export default () => {
    type TableInfo = {tableId: string, tableName: string}
    const [tableList, setTableList] = useState<TableInfo[]>([])
    const [tableDataRange, setTableDataRange] = useState<IDataRange[]>([])
    type NumberFieldInfo = {fieldId: string, fieldName: string}
    const dispatch = useAppDispatch()
    const [numberFieldList, setNumberFieldList] = useState<NumberFieldInfo[]>([])
    const config = useAppSelector(store => store.config.config)
    
    // because Form in semi-design requires formApi, and it has to be
    // within the Form's context, so an additional component (DefaultValueSetter) is created to 
    // keep formApi instances
    const emptyDefaultValueSetter = (value: string) => {}
    let setDefaultValues = {
        form: (values:ConfigPayload) => {},
        dataSource: emptyDefaultValueSetter,
        dataRange: emptyDefaultValueSetter,
        currentValueAggField: emptyDefaultValueSetter
    }

    const DefaultValueSetter = () => {
        const dataRangeFieldApi = useFieldApi('dataRange')
        const dataSourceFieldApi = useFieldApi('dataSource')
        const currentValueAggFieldApi = useFieldApi('currentValueAggField')
        const formApi = useFormApi()
        setDefaultValues.form = (values ) => { formApi.setValues(values) }
        setDefaultValues.dataSource = (value: string) => { dataSourceFieldApi.setValue(value) }
        setDefaultValues.dataRange = (value: string) => { dataRangeFieldApi.setValue(value) }
        setDefaultValues.currentValueAggField = (value: string) => { currentValueAggFieldApi.setValue(value) }
        return '';
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

    const fetchInitData = async() => {
        const tableListData = await getTableList();
        const configState = await dispatch<Promise<ConfigPayload>>(loadConfig())
        setTableList(tableListData);

        if (tableListData.length > 0) {
            if (configState.dataSource != '') {
                await onDataSourceChange(configState.dataSource!)
                setDefaultValues.form(configState)
            }
            else {
                const firstTableId = tableListData[0].tableId
                setDefaultValues.dataSource(firstTableId)
                await onDataSourceChange(firstTableId)
                setDefaultValues.dataRange('{"type":"ALL"}')
            }
        }
    }
    useEffect(() => {
        fetchInitData()
    }, [])

    return <Form labelPosition='top' className='configForm' 
                onChange={(formData) => {
                    dispatch(updatePreviewData(formData.values as ConfigPayload))
                    dispatch(setConfigState(formData.values as ConfigPayload))
                }}
                onSubmit={(formData) => dispatch(saveConfig(formData as ConfigPayload))}>
        <div className='configFields'>
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

            <Form.RadioGroup field="chartType" label="图表形状" type='pureCard' direction='horizontal' className='chartTypePicker'>
                <Form.Radio value="bar">
                    <div className='iconFrame bar'></div>
                    <div className='chartTypeLabel'>条形</div>
                </Form.Radio>
                <Form.Radio value="semiCircular">
                    <div className='iconFrame semiCircular'></div>
                    <div className='chartTypeLabel'>半环</div>
                </Form.Radio>
                <Form.Radio value="circular">
                    <div className='iconFrame circular'></div>
                    <div className='chartTypeLabel'>环形</div>
                </Form.Radio>
            </Form.RadioGroup>

            <Form.RadioGroup field="color" label="颜色" initValue='rgba(53, 189, 75, 1)' type='pureCard' direction='horizontal' className='colorPicker'> 
                {
                    themeColors.map((color) => {
                        return <Form.Radio key={color} value={color} style={{borderColor: color}}>
                            <div className='swatch' style={{backgroundColor: color}}></div>
                        </Form.Radio>
                    })
                }
            </Form.RadioGroup>

            <Divider/>

            <Form.Input field="targetValue" label="目标值" initValue={100}></Form.Input>

            <Form.Select field="currentValueCalcMethod" label="当前值" initValue="count">
                <Select.Option value="count">统计字段总数</Select.Option>
                <Select.Option value="calc">统计字段数值</Select.Option>
            </Form.Select>

                
            { config.currentValueCalcMethod === 'calc' ?
                <Form.Select field="currentValueAggField" initValue=""  label="选择字段" className='currentValueAggField' showArrow={false}
                        optionList={ numberFieldList.map(fieldInfo => ({value: fieldInfo.fieldId, label: fieldInfo.fieldName}) )}
                        prefix={<div className='prefixIcon'><IconFormular/></div>}
                        suffix={
                            <Form.Select field="currentValueAggMethod" className='currentValueAggMethod' noLabel={true} showArrow={false}
                                    initValue="SUM"  onFocus={(e) => {e.stopPropagation()}} dropdownClassName="aggMethodDropdown" position='bottomRight'
                                    suffix={<div className='suffixIcon'><IconMore/></div>}>
                                <Select.Option value="SUM">求和</Select.Option>
                                <Select.Option value="AVERAGE">平均值</Select.Option>
                                <Select.Option value="MAX">最大值</Select.Option>
                                <Select.Option value="MIN">最小值</Select.Option>
                            </Form.Select>
                        }
                        >
                </Form.Select>
            : undefined }

            <Form.InputGroup label={{ text: "单位" }} className='fieldUnit'>
                <Form.Input field="unitSign" initValue="$" className='unitSymbol'></Form.Input>
                <Form.RadioGroup type="button" field="unitPosition" initValue="left" className="unitPosition">
                    <Form.Radio value="left">左</Form.Radio>
                    <Form.Radio value="right">右</Form.Radio>
                </Form.RadioGroup>
            </Form.InputGroup>

            <Form.InputGroup label={{ text: "格式" }} className='fieldNumericFormat'>
                <Form.Select field="numericDigits" initValue={0}>
                    <Select.Option value={0}>整数</Select.Option>
                    <Select.Option value={1}>保留1位小数</Select.Option>
                    <Select.Option value={2}>保留2位小数</Select.Option>
                </Form.Select>
                <Form.Checkbox field="numericAbbrKilos" initValue={false}>千位缩写</Form.Checkbox>

            </Form.InputGroup>

        </div>
        <div className='configActions'>
            <Button theme='solid' type="primary" htmlType="submit" className="btn-margin-right">确定</Button>
        </div>
        
        <DefaultValueSetter/>
    </Form>
}
