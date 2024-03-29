import SettingsPanel from './settings-panel';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import boardState from '../util/board-state';
import { createColumnJson, createKanbanJson } from '../util/kanban-types';
import clone from 'just-clone';
import { randomString } from '../util/test-helpers';
import vscodeHandler from '../util/vscode-handler';

function* panelSetup() {
    const wrapper = render(<SettingsPanel isOpen={true} closeSettings={() => null} />);
    const histPanel = wrapper.container.firstElementChild as HTMLDivElement;
    yield histPanel;

    const histScroller = histPanel.querySelector('.history-scroller') as HTMLDivElement;
    yield histScroller;

    wrapper.unmount();
}

const togglePanel = () => window.dispatchEvent(new CustomEvent('toggle-settings'));

describe('SettingsPanel', () => {
    it('can set and unset autosave', () => {
        const setup = panelSetup();
        const settings = setup.next().value as HTMLDivElement;
        togglePanel();

        const autosaveToggle = settings.querySelector('#settings-autosave') as HTMLAnchorElement;
        const spy = jest.spyOn(boardState, 'setAutosave');

        userEvent.click(autosaveToggle);
        expect(spy).toHaveBeenCalled();
        setup.return();
    });

    it('can set and unset save-to-file', () => {
        const setup = panelSetup();
        const settings = setup.next().value as HTMLDivElement;
        togglePanel();

        const fileToggle = settings.querySelector('#settings-savefile') as HTMLAnchorElement;
        const spy = jest.spyOn(boardState, 'setSaveToFile');

        userEvent.click(fileToggle);
        expect(spy).toHaveBeenCalled();
        setup.return();
    });

    it('can open global extension settings', () => {
        const setup = panelSetup();
        const settings = setup.next().value as HTMLDivElement;
        togglePanel();

        const link = settings.querySelector('#global-settings-link') as HTMLAnchorElement;
        const spy = jest.spyOn(vscodeHandler, 'openExtensionSettings');

        userEvent.click(link);
        expect(spy).toHaveBeenCalled();
        setup.return();
    });
});
