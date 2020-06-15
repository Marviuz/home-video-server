import axios from 'axios'
import config from '@/config'

export default axios.create({
  baseURL: 'http://' + config.ip + ':8081/api/'
})