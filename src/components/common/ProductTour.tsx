import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ProductTourProps {
  onComplete: () => void;
}

export const ProductTour: React.FC<ProductTourProps> = ({ onComplete }) => {
  const { t } = useApp();
  const tourSteps = [
    { target: 'business', title: t('yourBusiness'), description: t('shopIntro') },
    { target: 'ad-prompt', title: t('offerQuestion'), description: t('offerHint') },
    { target: 'ad-generate', title: t('chooseAd'), description: t('editBeforeShare') },
    { target: 'ad-preview', title: t('preview'), description: t('sampleOnly') },
  ];
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [cardHeight, setCardHeight] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const step = tourSteps[stepIndex];

  useEffect(() => {
    const target = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
    if (!target) {
      setTargetRect(null);
      return;
    }

    const updateRect = () => {
      const rect = target.getBoundingClientRect();
      setTargetRect(rect.width > 0 && rect.height > 0 ? rect : null);
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [step.target]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    headingRef.current?.focus();
    const updateHeight = () => setCardHeight(card.getBoundingClientRect().height);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(card);
    return () => observer.disconnect();
  }, [stepIndex]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onComplete();
      return;
    }
    if (event.key !== 'Tab') return;

    const controls = cardRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
    if (!controls?.length) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (
      event.shiftKey &&
      (document.activeElement === first || document.activeElement === headingRef.current)
    ) {
      event.preventDefault();
      last.focus();
    } else if (
      !event.shiftKey &&
      (document.activeElement === last || document.activeElement === headingRef.current)
    ) {
      event.preventDefault();
      first.focus();
    }
  };

  const cardTop =
    targetRect && targetRect.bottom + cardHeight + 20 <= window.innerHeight
      ? targetRect.bottom + 12
      : targetRect
        ? Math.max(12, targetRect.top - cardHeight - 12)
        : Math.max(12, (window.innerHeight - cardHeight) / 2);

  const cardLeft = targetRect
    ? Math.max(
        16,
        Math.min(targetRect.left, window.innerWidth - Math.min(384, window.innerWidth - 32) - 16)
      )
    : Math.max(16, (window.innerWidth - 384) / 2);

  return (
    <div
      className="fixed inset-0 z-[70] bg-slate-950/60"
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-tour-title"
      aria-describedby="product-tour-description"
    >
      {targetRect && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed rounded-xl border-2 border-white shadow-[0_0_0_9999px_rgba(15,23,42,0.68)]"
          style={{
            left: targetRect.left - 4,
            top: targetRect.top - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        />
      )}

      <div
        ref={cardRef}
        className="fixed w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-2xl"
        style={{ top: cardTop, left: cardLeft }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500">
              {stepIndex + 1} / {tourSteps.length}
            </p>
            <h2
              ref={headingRef}
              id="product-tour-title"
              tabIndex={-1}
              className="mt-1 text-base font-semibold focus:outline-none"
            >
              {step.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onComplete}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900"
            aria-label={t('skip')}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <p id="product-tour-description" className="mt-2 text-sm leading-relaxed text-slate-600">
          {step.description}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onComplete}
            className="min-h-10 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900"
          >
            {t('skip')}
          </button>
          <div className="flex items-center gap-2">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={() => setStepIndex((index) => index - 1)}
                className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {t('back')}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (stepIndex === tourSteps.length - 1) {
                  onComplete();
                } else {
                  setStepIndex((index) => index + 1);
                }
              }}
              className="inline-flex min-h-10 items-center gap-1 rounded-lg bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              {t('continue')}
              {stepIndex !== tourSteps.length - 1 && (
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
