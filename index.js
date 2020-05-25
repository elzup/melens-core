const bplist = require('bplist')
const chokidar = require('chokidar')
const fs = require('fs')

const userHome =
  process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME']
const plistPath = `${userHome}/Library/Containers/com.takohi.octomouse/Data/Library/Preferences/com.takohi.octomouse.plist`
const watcher = chokidar.watch(plistPath)

const pad02 = (v) => ('0' + v).slice(-2)
const getDateStr = () => {
  const date = new Date()
  return {
    ymd: `${date.getFullYear()}-${pad02(date.getMonth() + 1)}-${pad02(
      date.getDate()
    )}`,
    date,
    hm: `${pad02(date.getHours())}${pad02(date.getMinutes())}`,
  }
}

watcher.on('add', changedFile).on('change', changedFile)

const loadFileSync = (path) => {
  if (fs.existsSync(path)) {
    const data = fs.readFileSync(path, 'utf8')
    return JSON.parse(data)
  }
  return {}
}

let prevMemo = null

const clone = (obj) => JSON.parse(JSON.stringify(obj))

function changedFile(path) {
  bplist.parseFile(path, function (err, object) {
    if (err) throw new Error(err)
    const { ymd, hm } = getDateStr()
    const octs = object[0].global

    const prev = clone(prevMemo)
    prevMemo = octs

    if (!prev) return

    const saveFile = __dirname + '/' + ymd + '.json'
    const data = loadFileSync(saveFile)

    if (!data[hm]) data[hm] = { key: 0, mouse: 0 }
    const dk = octs.keyDown - prev.keyDown
    const dm = octs.mouseDistance - prev.mouseDistance

    if (dk + dm === 0) return
    data[hm].key += dk
    data[hm].mouse += dm
    if (data[hm]) {
      fs.writeFileSync(saveFile, JSON.stringify(data))
    }
  })
}
