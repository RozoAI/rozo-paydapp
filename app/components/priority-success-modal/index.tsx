import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { forwardRef, useImperativeHandle, useState } from "react";
import { getNetworkName } from "~/lib/tokens";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";

type TokenBalance = {
	id: string;
	symbol?: string;
	name: string;
	chainId: number;
	balance: number;
	logoURI?: string;
};

interface PrioritySuccessModalProps {
	tokenPriority?: TokenBalance | null;
}

export interface PrioritySuccessModalRef {
	show: () => void;
}

const PrioritySuccessModal = forwardRef<
	PrioritySuccessModalRef,
	PrioritySuccessModalProps
>(({ tokenPriority }, ref) => {
	const [isOpen, setIsOpen] = useState(false);

	useImperativeHandle(ref, () => ({
		show: () => {
			setIsOpen(true);
		},
	}));

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-center">Priority Token Set!</DialogTitle>
				</DialogHeader>
				<div className="flex flex-col items-center gap-4">
					<DotLottieReact
						src="/Success.lottie"
						loop
						autoplay
						speed={1.2}
						className="scale-[1.4]"
					/>

					{tokenPriority && (
						<div className="text-center">
							<p className="text-muted-foreground text-sm">
								Successfully set{" "}
								<b>
									{tokenPriority.symbol || tokenPriority.name}
									{tokenPriority.chainId &&
										` (${getNetworkName(tokenPriority.chainId)})`}
								</b>{" "}
								as your priority token
							</p>
						</div>
					)}
				</div>

				<DialogFooter className="flex justify-center">
					<Button
						variant="outline"
						onClick={() => setIsOpen(false)}
						className="w-full"
					>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
});

PrioritySuccessModal.displayName = "PrioritySuccessModal";

export default PrioritySuccessModal;
