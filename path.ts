/**
 * Not using built-in path.join() before that is platform-sensitive (which is not suitable to web urls)
 *  */

function last(string: string): string {
  return string[string.length - 1]
}

export function join(...paths: string[]): string {
  let acc = '/'
  paths.forEach(path => {
    const is_acc_endsWith = last(acc) === '/'
    const is_path_startsWith = path[0] === '/'
    if (is_acc_endsWith && is_path_startsWith) {
      path = path.slice(1)
    } else if (!is_acc_endsWith && !is_path_startsWith) {
      acc += '/'
    }
    acc += path
  })
  if (last(acc) === '/') {
    acc = acc.slice(0, acc.length - 1)
  }
  return acc
}
