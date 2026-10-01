import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/atoms/Button';
import { Modal } from '@/components/molecules/Modal';
import type { CampaignView } from '@/features/marketing/campaign/campaignModel';
import type { SendTiming } from '@/features/marketing/campaign/campaignModel';

type SendCompleteModalProps = {
  view: CampaignView;
  timing: SendTiming;
  onClose: () => void;
  onNewCampaign: () => void;
};

export function SendCompleteModal({
  view,
  timing,
  onClose,
  onNewCampaign,
}: SendCompleteModalProps) {
  const campaignLabel = view.matchedPreset?.label ?? view.segmentLabel;

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-7 w-7 text-green-600" />
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold text-gray-900">
            {timing === 'now' ? '발송을 완료했어요' : '발송을 예약했어요'}
          </h2>
          <p className="text-sm text-gray-600">
            &lsquo;{campaignLabel}&rsquo; ·{' '}
            {view.targetCount.toLocaleString('ko-KR')}명
          </p>
          <p className="text-sm text-gray-600">
            {view.channel.label} ·{' '}
            {timing === 'now' ? '즉시 발송' : '예약 발송'}
          </p>
        </div>
        <div className="w-full rounded-lg bg-gray-50 px-4 py-3 text-xs text-gray-600">
          반응 결과는 접촉 이력과 성과 리포트에서 확인할 수 있어요
        </div>
        <div className="flex w-full gap-2">
          <Link
            to="/marketing/history"
            onClick={onClose}
            className="flex h-9 flex-1 items-center justify-center rounded-md border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            접촉 이력 보기
          </Link>
          <Button className="flex-1" onClick={onNewCampaign}>
            새 캠페인 만들기
          </Button>
        </div>
      </div>
    </Modal>
  );
}
