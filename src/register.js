import React from 'react';
import { addons, types } from '@storybook/addons';
import { CURRENT_STORY_WAS_SET, STORY_SPECIFIED, SET_STORIES, STORY_CHANGED, STORY_RENDERED } from '@storybook/core-events';
import { AddonPanel } from '@storybook/components';

const ADDON_ID = 'seachicken/storybook-inga';
const PANEL_ID = `${ADDON_ID}/panel`;
const STYLE_ID = `${ADDON_ID}-highlight`;
const INGA_PREFIX = '📌 ';
const INGA_SUFIX = ' (Inga)';

const MyPanel = () => <div>MyAddon</div>;

const highlightStyle = `
  outline: 2px dashed red;
  outline-offset: 2px;
  box-shadow: 0 0 0 6px rgba(255,255,255,0.6);
`;

addons.register(ADDON_ID, (api) => {
  let storyInputs = [];
  let defaultStoryId;
  let firstIngaStoryId;
  let waitingStoryId;
  let renderedStoryId;
  let completed = false;

  const sleep = millis => new Promise(resolve => setTimeout(resolve, millis));

  api.on(SET_STORIES, payload => {
    storyInputs = Object
      .entries(payload.stories)
      .map(story => story[1]);
  });

  api.on(CURRENT_STORY_WAS_SET, async ({ storyId }) => {
    if (defaultStoryId) {
      return;
    } else {
      defaultStoryId = storyId;
    }

    for (const input of storyInputs) {
      api.selectStory(input.kind, input.story);
      waitingStoryId = input.id;
      let timeoutMillis = 0;
      const waitMillis = 1;
      while (waitingStoryId !== renderedStoryId) {
        if (timeoutMillis > 1000) {
          console.warn(`rendering timed out. storyId: ${waitingStoryId}`);
          break;
        }
        await sleep(waitMillis);
        timeoutMillis += waitMillis;
      }
    }

    api.setStories(storyInputs);

    const defaultInput = storyInputs
      .find(input => input.id === (firstIngaStoryId ? firstIngaStoryId : defaultStoryId));
    api.selectStory(defaultInput.kind, defaultInput.story);

    completed = true;
  });

  api.on(STORY_RENDERED, storyId => {
    renderedStoryId = storyId;
    const storyInput = storyInputs.find(input => input.id === storyId);

    const preview = document.getElementById('storybook-preview-iframe').contentWindow.document;
    if (!preview) {
      return;
    }

    const style = document.createElement('style');
    style.setAttribute('id', STYLE_ID);
    style.innerHTML =
      `[data-inga]{
        ${highlightStyle}
      }`;
    preview.head.appendChild(style);

    const ingaElements = Array.from(preview.querySelectorAll('[data-inga]'))
      .filter(e => window.getComputedStyle(e).display !== 'none');
    if (ingaElements.length >= 1) {
      if (!firstIngaStoryId) {
        firstIngaStoryId = storyId;
      }
      if (!storyInput.name.startsWith(INGA_PREFIX)) {
        storyInput.name = `${INGA_PREFIX}${storyInput.name}${INGA_SUFIX}`;
      }
    }
  });

  api.on(STORY_CHANGED, () => {
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

