const REGEX: Record<string, RegExp> = {
  NON_WHITE_SPACE: /\S/,
  DIGITS: /^\d+$/,
  EMAIL:
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\])|(([a-z\-0-9]+\.)+[a-z]{2,}))$/i
};

export default REGEX;
