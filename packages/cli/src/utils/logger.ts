import kleur from "kleur"

export const logger = {
  error(message: string) {
    console.log(kleur.red(message))
  },
  warn(message: string) {
    console.log(kleur.yellow(message))
  },
  info(message: string) {
    console.log(kleur.cyan(message))
  },
  success(message: string) {
    console.log(kleur.green(message))
  },
  break() {
    console.log("")
  },
}
