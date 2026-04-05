import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export async function signUp({ email, password, fullName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function upsertProfile({ branch, year, bio, avatarUrl }) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        user_id: user.id,
        branch,
        year,
        bio,
        avatar_url: avatarUrl,
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function uploadResource({ file, title, description, subject, semester, resourceType }) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error('User not authenticated');

  const fileExt = file.name.split('.').pop();
  const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('resources')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from('resources').getPublicUrl(filePath);

  const { data, error } = await supabase
    .from('resources')
    .insert({
      title,
      description,
      subject,
      semester,
      resource_type: resourceType,
      file_url: publicUrl,
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createMarketplaceItem({ title, description, price, file, contactPhone }) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error('User not authenticated');

  let imageUrl = null;

  if (file) {
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('marketplace')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from('marketplace').getPublicUrl(filePath);

    imageUrl = publicUrl;
  }

  const { data, error } = await supabase
    .from('marketplace_items')
    .insert({
      title,
      description,
      price,
      image_url: imageUrl,
      seller_id: user.id,
      contact_phone: contactPhone,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchNotifications() {
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      id,
      title,
      content,
      attachment_type,
      image_url,
      file_url,
      created_at,
      created_by,
      users:created_by (
        id,
        name,
        email
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchMarketplaceItems() {
  const { data, error } = await supabase
    .from('marketplace_items')
    .select(`
      id,
      title,
      description,
      price,
      image_url,
      status,
      contact_phone,
      created_at,
      seller_id,
      users:seller_id (
        id,
        name
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createNotification({ title, content, file, attachmentType }) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error('User not authenticated');

  let imageUrl = null;
  let fileUrl = null;

  if (file) {
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('notifications')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from('notifications').getPublicUrl(filePath);

    if (attachmentType === 'image') {
      imageUrl = publicUrl;
    }

    if (attachmentType === 'pdf') {
      fileUrl = publicUrl;
    }
  }

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      title,
      content,
      attachment_type: attachmentType,
      image_url: imageUrl,
      file_url: fileUrl,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
