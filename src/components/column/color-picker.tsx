/**
 * @file A component which exists inside a {@link Column} which can change the color of that Column.
 */

import React from 'react';
import boardState from '../../util/board-state';

const darkSwatches = [
    // colors to pick from in light mode
    '#eb144c', // red
    '#ff6900', // orange
    '#fcb900', // yellow
    '#7bdcb5', // lighter green
    '#00d084', // light green
    '#8ed1fc', // lighter blue
    '#0693e3', // blue
    '#f78da7', // pink
    '#9900ef', // purple
    '#abb8c3', // light gray
];
const lightSwatches = [
    // colors to pick from in dark mode
    '#dd302a', // red
    '#cf4d19', // burnt orange
    '#ec9c25', // gold
    '#7ac41a', // light green
    '#416a0b', // green
    '#338c84', // teal
    '#344fa2', // indigo
    '#d741e3', // pink
    '#9900ef', // purple
    '#6a6a6a', // dark grey
];

/**
 * Selection of colored swatches and a text input that exists within a {@link Column}.
 * Used to change the color of that Column.
 *
 *
 * @param {boolean} isOpen whether the component is currently open
 * @param {string} color current color of the containing Column
 * @param {Function} changeColor function used to change the color of the containing Column
 */
export default function ColorPicker({
    isOpen,
    color,
    changeColor,
}: {
    isOpen: boolean;
    color: string;
    changeColor: (color: string) => void;
}): JSX.Element {
    const [textColor, setTextColor] = React.useState(color.slice(1));
    const swatches = boardState.isLightMode ? lightSwatches : darkSwatches;

    const onInputChange = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const newColor = event.target.value;
            if (newColor.length > 6 || !/^[\da-fA-F]*$/.test(newColor)) {
                return;
            }
            setTextColor(newColor);
            console.log(newColor);
        },
        [setTextColor]
    );

    const validateAndChangeColor = React.useCallback(
        (color: string) => {
            if (color.length === 3) {
                changeColor(`#${color[0]}${color[0]}${color[1]}${color[1]}${color[2]}${color[2]}`);
            } else if (color.length === 6) {
                changeColor(`#${color}`);
            }
        },
        [changeColor]
    );

    const makeSwatchButton = React.useCallback(
        (swatch: string) => (
            <button
                key={swatch}
                className="column-color-picker__swatch"
                style={{ backgroundColor: swatch }}
                onClick={() => changeColor(swatch)}
            />
        ),
        []
    );

    const swatchButtons = React.useMemo(
        () => swatches.map(makeSwatchButton),
        [swatches, makeSwatchButton]
    );

    const colorPickerStyle = {
        // CSS styles so that color picker "swipes" open and closed
        maxHeight: isOpen ? '6rem' : 0,
        pointerEvents: isOpen ? 'all' : 'none',
        transition: 'max-height 0.4s linear',
    } as const;

    return (
        <div className="column-color-picker" style={colorPickerStyle}>
            {swatchButtons}
            <div className="text-picker">
                <div className="input-tag"> # </div>
                <input
                    value={textColor}
                    onChange={onInputChange}
                    onBlur={() => validateAndChangeColor(textColor)}
                />
            </div>
        </div>
    );
}
