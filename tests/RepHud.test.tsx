import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RepHud } from '../src/features/rep-counter/ui/RepHud';
import { EN } from '../src/features/rep-counter/i18n/labels';

describe('RepHud', () => {
  it('renders the count with an aria-live region', () => {
    render(<RepHud count={7} phase="down" lastRepGoodForm={true} labels={EN} />);
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByLabelText(`7 ${EN.reps}`)).toHaveAttribute(
      'aria-live',
      'polite',
    );
    expect(screen.getByText(EN.phaseDown)).toBeInTheDocument();
    expect(screen.getByText(EN.goodForm)).toBeInTheDocument();
  });

  it('hides the form badge when form is null', () => {
    render(<RepHud count={0} phase="up" lastRepGoodForm={null} labels={EN} />);
    expect(screen.queryByText(EN.goodForm)).not.toBeInTheDocument();
    expect(screen.queryByText(EN.goLower)).not.toBeInTheDocument();
  });
});
