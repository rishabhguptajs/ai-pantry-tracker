declare module 'react-modal' {
    import * as React from 'react';
  
    interface Props {
      isOpen: boolean;
      onRequestClose?: (event: React.MouseEvent | React.KeyboardEvent) => void;
      style?: {
        content?: React.CSSProperties;
        overlay?: React.CSSProperties;
      };
      contentLabel?: string;
      portalClassName?: string;
      overlayClassName?: string;
      className?: string;
      bodyOpenClassName?: string;
      htmlOpenClassName?: string;
      ariaHideApp?: boolean;
      appElement?: HTMLElement | {};
      closeTimeoutMS?: number;
      aria?: {
        [key: string]: string;
      };
      shouldFocusAfterRender?: boolean;
      shouldCloseOnOverlayClick?: boolean;
      shouldCloseOnEsc?: boolean;
      onAfterOpen?: () => void;
      onAfterClose?: () => void;
      parentSelector?: () => HTMLElement;
      ariaDescribedBy?: string;
      ariaLabelledBy?: string;
      role?: string;
      contentRef?: (instance: HTMLDivElement) => void;
      overlayRef?: (instance: HTMLDivElement) => void;
      id?: string;
      children?: React.ReactNode;
    }
  
    export default class Modal extends React.Component<Props> {
      static setAppElement(element: string | HTMLElement): void;
    }
  }
  