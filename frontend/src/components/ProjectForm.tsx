import { TextInput, Textarea, Button, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';

interface ProjectFormProps {
  onSubmit: (values: { title: string; description: string }) => Promise<void>;
}

export function ProjectForm({ onSubmit }: ProjectFormProps) {
  const form = useForm({
    initialValues: {
      title: '',
      description: '',
    },
    validate: {
      title: (value) => (!value ? 'Title is required' : null),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack>
        <TextInput
          required
          label="Title"
          placeholder="Project title"
          {...form.getInputProps('title')}
        />
        <Textarea
          label="Description"
          placeholder="Project description"
          {...form.getInputProps('description')}
        />
        <Button type="submit">Create Project</Button>
      </Stack>
    </form>
  );
}

