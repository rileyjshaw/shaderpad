'use client';

import { useEffect, useState } from 'react';

export function P3SupportNotice() {
	const [supported, setSupported] = useState(true);
	useEffect(() => {
		setSupported(window.matchMedia?.('(color-gamut: p3)').matches ?? false);
	}, []);
	if (supported) return null;
	return <p className="font-bold">Your browser or display does not support Display P3.</p>;
}
