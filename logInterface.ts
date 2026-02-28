import { tap } from 'rxjs';

/**
 *
 * @param interfaceName Interface name
 * @returns Same stream
 * @description RXJS operator that generates interfaces for passed data and log it into console when on localhost
 * @example
 * ```ts
 * this.http.get('/endpoint').pipe(map(res => res.data), generateInterface('Interface name'))
 * ```
 */
export const logInterface = (interfaceName: string) => {
  return tap((obj: any) => {
    generateInterfaces(obj, interfaceName);
  });
};

/**
 *
 * @param obj Object to create interface for
 * @param rootName Interface name
 * @returns
 */
const generateInterfaces = (obj: any, rootName = 'Generated') => {
  const data = obj;
  let interfaceData;

  if (Array.isArray(data)) {
    interfaceData = mergeFromFirst(data);
  } else {
    interfaceData = data;
  }

  const interfaces: any = {};
  const processed = new Set();

  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const resolveType = (value: any, parentName: string, propName: string) => {
    if (value === null) return 'any';

    if (Array.isArray(value)) {
      if (value.length === 0) return 'any[]';

      const firstItem = value.find((v) => v !== null);

      if (!firstItem) return 'any[]';

      if (typeof firstItem === 'object' && !Array.isArray(firstItem)) {
        const interfaceName = parentName + capitalize(propName);
        generateInterface(firstItem, interfaceName);
        return `${interfaceName}[]`;
      }

      return `${resolvePrimitive(firstItem)}[]`;
    }

    if (typeof value === 'object') {
      const interfaceName = parentName + capitalize(propName);
      generateInterface(value, interfaceName);
      return interfaceName;
    }

    return resolvePrimitive(value);
  };

  const generateInterface = (obj: any, name: any) => {
    if (processed.has(name)) return;
    processed.add(name);

    interfaces[name] = '';

    const fields = Object.entries(obj)
      .map(([key, value]) => {
        const type = resolveType(value, name, key);
        return `  ${key}: ${type};`;
      })
      .join('\n');

    interfaces[name] = `interface ${name} {\n${fields}\n}`;
  };

  generateInterface(interfaceData, rootName);

  let result = Object.values(interfaces).join('\n\n');
  result = result.replace(
    `interface ${rootName} {`,
    `export interface ${rootName} {`,
  );
  colorizeInterface(result, rootName);
  return result;
};

/**
 *
 * @param code Console log output
 * @param rootName Name of interface
 * @description Colorize the console log to look good
 */
const colorizeInterface = (code: string, rootName: string) => {
  const styles: string[] = [];

  const purple = 'color: #C586C0; font-weight: bold;';
  const blue = 'color: #569CD6; font-weight: bold;';
  const green = 'color: #2cb69a; font-weight: bold;';
  const darkGreen = 'color: #75ba55; font-weight: bold;';
  const reset = '';

  const primitives = [
    'string',
    'number',
    'boolean',
    'any',
    'bigint',
    'undefined',
    'symbol',
  ];

  //primitives first, then export/interface, then capitalized words
  const regex = new RegExp(
    `\\b(${primitives.join('|')})\\b|\\b(export)\\b|\\b(interface)\\b|\\b([A-Za-z0-9_]+)\\b`,
    'g',
  );

  let lastMatchedKeyword = '';

  const formatted = code.replace(
    regex,
    (match, primitiveWord, exportWord, interfaceWord, nameWord) => {
      if (primitiveWord) {
        styles.push(darkGreen, reset);
        lastMatchedKeyword = '';
        return `%c${primitiveWord}%c`;
      }
      if (exportWord) {
        styles.push(purple, reset);
        lastMatchedKeyword = 'export';
        return `%c${exportWord}%c`;
      }
      if (interfaceWord) {
        styles.push(blue, reset);
        lastMatchedKeyword = 'interface';
        return `%c${interfaceWord}%c`;
      }
      if (nameWord) {
        if (lastMatchedKeyword === 'interface') {
          styles.push(green, reset);
          lastMatchedKeyword = '';
          return `%c${nameWord}%c`;
        }
        return nameWord;
      }
      return match;
    },
  );
  if (location.href.includes('localhost')) {
    //delay to clear angular logs first
    setTimeout(() => {
      console.clear()
      console.groupCollapsed(
        `%cclick to view interface for %c${rootName}`,
        'color: #0fbffe; font-size: 14px',
        'color: #04d55b; font-size: 14px',
      );
      console.log(formatted, ...styles);
      console.groupEnd();
    }, 100);
  }
};

const resolvePrimitive = (value: string) => {
  switch (typeof value) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'bigint':
      return 'bigint';
    case 'symbol':
      return 'symbol';
    case 'undefined':
      return 'undefined';
    default:
      return 'any';
  }
};

/**
 *
 * @param items Array of items
 * @returns Item of the array containing minimum null values
 * @description Some array items have properties that are null, instead of setting that property to type 'any',
 * we loop trough every item and try to find if that property is not null somewhere and we take that value
 */
const mergeFromFirst = (items: any) => {
  if (!items.length) return {};

  return items.slice(1).reduce(
    (acc: any, item: any) => {
      Object.entries(item).forEach(([key, value]) => {
        if (value != null) {
          acc[key] = value;
        }
      });
      return acc;
    },
    { ...items[0] },
  );
};
