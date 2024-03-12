import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Link, RouteComponentProps } from "react-router-dom";
import { createShare, getCampaignById, getSharesByCampaign, useQuery } from "wasp/client/operations"
import { Share } from "wasp/entities";
import { cn } from "../../shared/utils";
import { FaCog, FaCopy, FaPen } from "react-icons/fa";

function buildContent(pattern: string, code: string) {
  // add: "#SharePli: {code}" to the end of the pattern
  return pattern + `\n\n#SharePli: ${code}`
}

export default function CampaignsPage(
  props: RouteComponentProps<{ id: string }>
) {
  const { data: campaign } = useQuery(getCampaignById, {
    campaignId: +props.match.params.id
  })
  const { data: shares, isLoading: isSharesLoading } = useQuery(getSharesByCampaign, {
    campaignId: +props.match.params.id
  })
  const [creating, setCreating] = useState(false)

  async function handleShareCreate() {
    setCreating(true)
    try {
      const { code } = await createShare({ campaignId: +props.match.params.id })
      const content = buildContent(campaign?.tweetPattern || '', code)

      navigator.clipboard.writeText(content)
      toast.success('Tweet pattern copied to clipboard')
    } catch (error: any) {
      console.error(error)
      toast.error(`Failed to create share: ${error.message}`)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className='py-10 lg:mt-10'>
      <Toaster />
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-4xl text-center'>
          <h3 className='mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white'>
            {campaign?.name}
          </h3>

          <p className='mx-auto mt-3 max-w-2xl text-center text-lg leading-8 text-gray-600 dark:text-white'>
            {campaign?.description}
          </p>
        </div>

        <div className='sm:w-[90%] md:w-[70%] lg:w-[50%] py-10 px-6 mx-auto my-8'>
          <textarea
            className='w-full h-40 p-4 border rounded-md border-gray-300 dark:border-gray-700'
            value={campaign?.tweetPattern}
            readOnly
          ></textarea>

          <div className='flex justify-center mt-4 w-full gap-4'>
            <button
              disabled={creating}
              onClick={handleShareCreate}
              className='font-medium text-gray-800/90 bg-yellow-50 shadow-md ring-1 ring-inset ring-slate-200 py-2 px-4 rounded-md hover:bg-yellow-100 duration-200 ease-in-out focus:outline-none focus:shadow-none hover:shadow-none flex-1'
            >
              <FaCopy className='inline-block mr-2' />
              {creating ? 'Creating...' : 'Copy a tweet'}
            </button>

            <Link to={`/campaigns/${props.match.params.id}/edit`}>
              <button
                className='font-medium text-gray-800/90 bg-yellow-50 shadow-md ring-1 ring-inset ring-slate-200 py-2 px-4 rounded-md hover:bg-yellow-100 duration-200 ease-in-out focus:outline-none focus:shadow-none hover:shadow-none flex-1'
              >
                <FaCog className='inline-block mr-2' />
                Edit
              </button>
            </Link>
          </div>

          <div className='mt-8'>
            {isSharesLoading
              ? <div>Loading...</div>
              : <ListShare shares={shares || []} />
            }
          </div>
        </div>
      </div>
    </div>
  )
}

function ListShare(props: { shares: Share[] }) {
  const sucessCount = props.shares.filter(share => share.success).length

  return <div className="">
    <div className="flex flex-col md:flex-row justify-between items-center mb-3">
      <h4 className="mb-2 text-xl font-semibold text-black dark:text-white">Shares tracking</h4>
      <div className="flex gap-3">
        <p className="text-meta-5">Total: {props.shares.length}</p>
        <p className="text-meta-1">Waiting: {props.shares.length - sucessCount}</p>
        <p className="text-meta-3">Success: {sucessCount}</p>
      </div>
    </div>

    <div className="flex flex-wrap gap-2 justify-center">
      {props.shares.map(share => {
        return <div
          key={share.id}
          className={cn(
            'p-2 border rounded-md border-gray-300 dark:border-gray-700 text-center text-sm',
            share.success ? 'bg-green-100' : 'bg-orange-100'
          )}
        >{share.code}</div>
      })}
    </div>
  </div>
}
