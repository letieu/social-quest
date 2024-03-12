import { useState } from 'react';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { createCampaign, deleteCampain, getCampaignById, updateCampaign, useQuery } from 'wasp/client/operations';
import { Campaign } from 'wasp/entities';

export default function EditCampaignPage(
  props: RouteComponentProps<{ id?: string }>
) {
  console.log('EditCampaignPage', props.match.params.id)
  const isEditing = !!props.match.params.id;
  const campaignId = props.match.params.id ? parseInt(props.match.params.id) : 0;

  const { data: campaign, isLoading: isCampaignLoading } = useQuery(
    getCampaignById,
    { campaignId },
  );

  return (
    <div className='py-10 lg:mt-10'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-4xl text-center'>
          <h3 className='mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white'>
            {isEditing ? 'Edit' : 'Create'} Campaign
          </h3>
        </div>

        <div className='my-8 border rounded-3xl border-gray-900/10 dark:border-gray-100/10'>
          <div className='sm:w-[90%] md:w-[70%] lg:w-[50%] py-10 px-6 mx-auto my-8 space-y-10'>
            <CampaignForm isEditing={isEditing} editCampaign={campaign || undefined} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CampaignForm({ isEditing, editCampaign }: { isEditing: boolean, editCampaign?: Campaign }) {
  const [submitting, setSubmitting] = useState(false);
  const history = useHistory();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      event.currentTarget.reset();

      if (isEditing) {
        await updateCampaign({
          id: editCampaign?.id,
          name: formData.get('name') as string,
          description: formData.get('description') as string,
          webhookUrl: formData.get('webhookUrl') as string,
          tweetPattern: formData.get('tweetPattern') as string,
        });

        history.push(`/campaigns/${editCampaign?.id}`);
      } else {
        const created = await createCampaign({
          name: formData.get('name') as string,
          description: formData.get('description') as string,
          webhookUrl: formData.get('webhookUrl') as string,
          tweetPattern: formData.get('tweetPattern') as string,
        });

        history.push(`/campaigns/${created.id}`);
      }
    } catch (err: any) {
      window.alert('Error: ' + err.message)
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!isEditing) {
      return;
    }

    if (window.confirm('Are you sure you want to delete this campaign?')) {
      console.log('delete campaign', editCampaign?.id)
      await deleteCampain(+editCampaign?.id!)
      history.push('/campaigns');
    }
  }

  return (
    <form className='flex flex-col justify-center gap-10' onSubmit={handleSubmit}>
      <div className="p-6.5">
        <div className="mb-4.5">
          <label className="mb-2.5 block text-black dark:text-white">
            Campaign name <span className="text-meta-1">*</span>
          </label>
          <input
            defaultValue={editCampaign?.name}
            required
            name="name"
            placeholder="Enter campaign name"
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
          />
        </div>

        <div className="mb-4.5">
          <label className="mb-2.5 block text-black dark:text-white">
            Description
          </label>
          <input
            defaultValue={editCampaign?.description}
            name="description"
            placeholder="Enter campaign description"
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
          />
        </div>

        <div className="mb-4.5">
          <label className="mb-2.5 block text-black dark:text-white">
            Platform <span className="text-meta-1">*</span>
          </label>
          <div className="relative z-20 bg-transparent dark:bg-form-input">
            <select className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary">
              <option value="tw">Twitter</option>
              <option value="fb" disabled>Facebook</option>
              <option value="ig" disabled>Instagram</option>
              <option value="yt" disabled>Youtube</option>
              <option value="ln" disabled>LinkedIn</option>
              <option value="ti" disabled>TikTok</option>
            </select>
          </div>
        </div>

        <div className="mb-4.5">
          <label className="block text-black dark:text-white">
            Webhook URL
          </label>
          <small className="text-meta-5 mb-2.5 block">
            When new tweet are created, we will send a request to this URL.
          </small>
          <input
            defaultValue={editCampaign?.webhookUrl}
            required
            name="webhookUrl"
            type="text"
            placeholder="https://example.com/handle-new-tweet"
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
          />
        </div>

        <div className="mb-6">
          <label className="mb-2.5 block text-black dark:text-white">
            Tweet pattern <span className="text-meta-1">*</span>
          </label>
          <textarea
            defaultValue={editCampaign?.tweetPattern}
            name="tweetPattern"
            required
            rows={6}
            placeholder="🚀 Check out our new product from #SharePli.
https://example.com"
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
          ></textarea>
        </div>

        <div className="flex justify-center gap-4">
          <button className="flex w-full justify-center rounded bg-primary p-3 font-medium text-white" type="submit" disabled={submitting}>
            {isEditing ? 'Save' : 'Create'} Campaign
          </button>
          {isEditing && <button
            className="flex w-full justify-center rounded bg-danger p-3 font-medium text-white"
            type="button"
            onClick={handleDelete}
            disabled={submitting}
          >
            Delete
          </button>}
        </div>
      </div>
    </form >
  );
}
