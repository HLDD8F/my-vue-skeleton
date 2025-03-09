import type { FormItemRule as Rule } from 'element-plus';
import { i18t } from '@/shared/i18n/i18n';
import isBoolean from 'lodash-es/isBoolean.js';
import isFunction from 'lodash-es/isFunction.js';
import isRegExp from 'lodash-es/isRegExp.js';
import REGEX from './regex';

type TriggerType = 'blur' | 'change' | Array<'change' | 'blur'>;

const trigger: TriggerType = ['change', 'blur'];

type ValidFunc = (value: string) => boolean;

function validateFactory(
  validRule: RegExp | ValidFunc,
  message: string,
  isRequired: boolean,
  newTrigger?: TriggerType
): Rule {
  return {
    trigger: newTrigger || trigger,
    validator: (_rule, value, callback) => {
      let isValid = false;
      if (isRegExp(validRule)) {
        isValid = validRule.test(value);
      } else if (isFunction(validRule)) {
        isValid = validRule(value);
      }
      if (isValid || (!isRequired && value === '')) {
        callback();
      } else {
        callback(new Error(message));
      }
    }
  };
}

function validateRequired(): Rule {
  const rule = validateFactory(
    (value: string | boolean) => {
      if (isBoolean(value)) {
        return value;
      }
      value += '';
      return REGEX.NON_WHITE_SPACE.test(value);
    },
    i18t('validation.required'),
    true
  );
  rule.required = true;
  return rule;
}

function validateRangeFactory(
  min: number,
  max: number,
  message: string
): Rule {
  return validateFactory(
    (value: string) => {
      return (
        REGEX.DIGITS.test(value)
        && Number.parseInt(value, 10) >= min
        && Number.parseInt(value, 10) <= max
      );
    },
    message,
    false
  );
}

function validateDigitsFactory(
  min: number,
  max: number,
  message: string
): Rule {
  return validateFactory(
    (value: string) => {
      return value.length >= min && value.length <= max;
    },
    message,
    false
  );
}

const rules: Record<string, Rule> = {
  required: validateRequired(),
  email: validateFactory(REGEX.EMAIL, i18t('validation.invalid_email'), false)
};

export default rules;
export {
  rules,
  validateDigitsFactory,
  validateFactory,
  validateRangeFactory
};
