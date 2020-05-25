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
      date.getHours()
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

let prev = {}
function changedFile(path) {
  bplist.parseFile(path, function (err, object) {
    if (err) throw new Error(err)
    const { ymd, hms } = getDateStr()
    const saveFile = __dirname + ymd + '.json'
    const data = loadFileSync(saveFile)
    const octs = object[0][ymd]

    if (prev) {
      prev = octs
      return
    }
    if (!data[hms]) data[hms] = { key: 0, mouse: 0 }
    data[hms].key += data.keyDown - octs.keyDown
    data[hms].mouse += data.mouseDistance - octs.mouseDistance
    console.log(hms)
    console.log(data[hms])

    fs.writeFileSync(saveFile, JSON.stringify(data))

    prev = octs
  })
}
