import type { ContactChannel } from '@/data/marketing';

type ChannelBadgeProps = {
  channel: ContactChannel;
};

const CHANNEL_BADGE_CLASS_NAME: Record<ContactChannel, string> = {
  문자: 'bg-blue-100 text-blue-800',
  텔레마케팅: 'bg-violet-100 text-violet-800',
  카카오: 'bg-yellow-100 text-yellow-800',
};

export function ChannelBadge({ channel }: ChannelBadgeProps) {
  return (
    <span
      className={`inline-flex h-6 items-center whitespace-nowrap rounded-md px-2.5 text-xs font-semibold ${CHANNEL_BADGE_CLASS_NAME[channel]}`}
    >
      {channel}
    </span>
  );
}
