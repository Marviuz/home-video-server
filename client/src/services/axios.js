import axios from 'axios'
import config from '@/config'

const _ = axios.create({
  baseURL: 'http://' + config.ip + ':8081/api/'
})

export const getAll = () => _.get('/all')
export const getItem = (src, query) => _.get(src, { params: query })