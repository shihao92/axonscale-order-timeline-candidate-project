declare module 'react-window' {
  import * as React from 'react';
  export interface ListChildComponentProps {
    index: number;
    style: React.CSSProperties;
  }
  export const FixedSizeList: React.ComponentType<any>;
  export default FixedSizeList;
}
