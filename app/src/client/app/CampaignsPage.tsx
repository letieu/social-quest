import type { Campaign } from 'wasp/entities';

import {
  useQuery,
  getUserCampaigns,
} from 'wasp/client/operations';

import { cn } from '../../shared/utils';
import { FaPlus } from 'react-icons/fa';
import { Link } from 'wasp/client/router';

export default function CampaignsPage() {
  return (
    <div className='py-10 lg:mt-10'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-4xl text-center'>
          <h2 className='mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white'>
            <span className='text-yellow-500'>Tweet campaign</span>
          </h2>
        </div>
        <p className='mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600 dark:text-white'>
          Create a tweet campaign to promote your product or service.
        </p>
        <div className='my-8 border rounded-3xl border-gray-900/10 dark:border-gray-100/10'>
          <div className='sm:w-[90%] md:w-[70%] lg:w-[50%] py-10 px-6 mx-auto my-8 space-y-10'>
            <NewCampaignForm />
          </div>
        </div>
      </div>
    </div>
  );
}

function NewCampaignForm() {
  const { data: campaigns, isLoading: isCampaignsLoading } = useQuery(getUserCampaigns);

  return (
    <div className='flex flex-col justify-center gap-10'>
      <div className='flex flex-col gap-3'>
        <div className='flex items-center justify-center gap-3'>
          <Link to='/campaigns/new'>
            <button
              type='button'
              className='min-w-[7rem] font-medium text-gray-800/90 bg-yellow-50 shadow-md ring-1 ring-inset ring-slate-200 py-2 px-4 rounded-md hover:bg-yellow-100 duration-200 ease-in-out focus:outline-none focus:shadow-none hover:shadow-none'
            >
              <FaPlus className='inline-block mr-2' />
              Add New Campaign
            </button>
          </Link>
        </div>
      </div>

      <div className='space-y-10 col-span-full'>
        {isCampaignsLoading && <div>Loading...</div>}
        {campaigns!! && campaigns.length > 0 ? (
          <div className='space-y-4'>
            {campaigns.map((campaign: Campaign) => (
              <CampaignItem
                key={campaign.id}
                id={campaign.id}
                name={campaign.name}
                description={campaign.description}
                createdAt={campaign.createdAt}
              />
            ))}
          </div>
        ) : (
          <div className='text-gray-600 text-center'>Add a campaign to get started.</div>
        )}
      </div>
    </div>
  );
}

type CampaignProps = Pick<Campaign, 'id' | 'name' | 'description' | 'createdAt'>;

function CampaignItem({ id, name }: CampaignProps) {
  return (
    <div className='flex items-center justify-between bg-purple-50 rounded-lg border border-gray-200 p-2 w-full'>
      <div className='flex items-center justify-between gap-5 w-full'>
        <div className='flex items-center gap-3'>
          <span
            className={cn('text-slate-600')}
          >
            {name}
          </span>
        </div>
      </div>
      <div className='flex items-center justify-end w-15'>
        <Link to={`/campaigns/:id/edit`} params={{ id }}>
          <button
            type='button'
            className='font-medium text-gray-800/90 bg-yellow-50 shadow-md ring-1 ring-inset ring-slate-200 py-2 px-4 rounded-md hover:bg-yellow-100 duration-200 ease-in-out focus:outline-none focus:shadow-none hover:shadow-none'
          >
            Edit
          </button>
        </Link>
      </div>
    </div>
  );
}
