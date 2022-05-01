import React from 'react';
import { addons, types } from '@storybook/addons';
import { useChannel } from '@storybook/api';
import { STORY_CHANGED, STORY_RENDERED } from '@storybook/core-events';
import { AddonPanel } from '@storybook/components';

const ADDON_ID = 'seachicken/storybook-inga';
const PANEL_ID = `${ADDON_ID}/panel`;
const STYLE_ID = `${ADDON_ID}-highlight`;

const MyPanel = () => <div>MyAddon</div>;

const highlightStyle = `
  outline: 2px dashed red;
  outline-offset: 2px;
  box-shadow: 0 0 0 6px rgba(255,255,255,0.6);
`;

addons.register(ADDON_ID, (api) => {
  api.on(STORY_RENDERED, storyId => {
    const preview = document.getElementById('storybook-preview-iframe').contentWindow.document;
    if (preview) {
      const ingaElements = preview.querySelectorAll('[data-inga]');

      const style = document.createElement('style');
      style.setAttribute('id', STYLE_ID);
      style.innerHTML =
        `[data-inga]{
          ${highlightStyle}
        }`;
      preview.head.appendChild(style);
    }
  });

  api.on(STORY_CHANGED, storyId => {
    const preview = document.getElementById('storybook-preview-iframe').contentWindow.document;
    if (preview) {
      const style = preview.getElementById(STYLE_ID);
      if (style) {
        style.parentNode.removeChild(style);
      }
    }
  });

  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: 'Inga',
    render: ({ active, key }) => (
      <AddonPanel active={active} key={key}>
        <MyPanel />
      </AddonPanel>
    ),
  });
});

