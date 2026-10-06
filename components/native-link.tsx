'use client';
import type {AnchorHTMLAttributes} from 'react';

/** Native navigation remains usable even if client routing fails to initialize. */
export default function NativeLink(props:AnchorHTMLAttributes<HTMLAnchorElement>){
  return <a {...props}/>;
}
